"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  RefreshCw,
  LogOut,
  Loader2,
  X,
  Send,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase/client";

type ConversationStatus = "HOT" | "WARM" | "NEW";

type Conversation = {
  id: string;
  customer_name: string;
  last_message: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type Business = {
  id: string;
  full_name: string | null;
  email: string;
};

export default function CustomerConversationsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const darkMode = resolvedTheme !== "light";

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [businesses, setBusinesses] = useState<Business[]>(
    []
  );

  const [userName, setUserName] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showNewConversation, setShowNewConversation] =
    useState(false);

  const [selectedBusiness, setSelectedBusiness] =
    useState("");

  const [initialMessage, setInitialMessage] =
    useState("");

  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  async function loadPage() {
    try {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      // ---------------------------------------------
      // CUSTOMER ROLE CHECK
      // ---------------------------------------------

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(
          `Unable to verify account: ${profileError.message}`
        );
      }

      if (!profile || profile.role !== "CUSTOMER") {
        router.replace("/dashboard");
        return;
      }

      setUserName(
        profile.full_name ||
          user.email?.split("@")[0] ||
          "there"
      );

      // ---------------------------------------------
      // LOAD CUSTOMER CONVERSATIONS
      // ---------------------------------------------

      const {
        data: conversationData,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, customer_name, last_message, status, created_at, updated_at, user_id"
        )
        .eq("customer_id", user.id)
        .order("updated_at", {
          ascending: false,
        });

      if (conversationError) {
        throw new Error(
          `Conversations: ${conversationError.message}`
        );
      }

      setConversations(conversationData ?? []);

      // ---------------------------------------------
      // LOAD BUSINESS ACCOUNTS
      // ---------------------------------------------

      const {
        data: businessData,
        error: businessError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "BUSINESS")
        .order("full_name", {
          ascending: true,
        });

      if (businessError) {
        throw new Error(
          `Businesses: ${businessError.message}`
        );
      }

      setBusinesses(businessData ?? []);
    } catch (err) {
      console.error(
        "CUSTOMER CONVERSATIONS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadPage();
  }

  async function handleLogout() {
    setError("");

    const { error: logoutError } =
      await supabase.auth.signOut();

    if (logoutError) {
      setError(
        `Logout failed: ${logoutError.message}`
      );
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  async function handleCreateConversation() {
    try {
      setError("");

      if (!selectedBusiness) {
        setError("Please select a business.");
        return;
      }

      const cleanMessage = initialMessage.trim();

      if (!cleanMessage) {
        setError("Please enter your message.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const business = businesses.find(
        (item) => item.id === selectedBusiness
      );

      if (!business) {
        setError(
          "Selected business could not be found."
        );
        return;
      }

      setCreating(true);

      // ---------------------------------------------
      // CHECK FOR EXISTING CONVERSATION
      // ---------------------------------------------

      const {
        data: existingConversation,
        error: existingConversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, user_id, customer_id, customer_name, last_message, status, created_at, updated_at"
        )
        .eq("user_id", business.id)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (existingConversationError) {
        throw new Error(
          `Conversation lookup: ${existingConversationError.message}`
        );
      }

      let conversationId: string;

      if (existingConversation) {
        conversationId = existingConversation.id;

        // ---------------------------------------------
        // CUSTOMER MESSAGE
        // ---------------------------------------------

        const { error: messageError } =
          await supabase.from("messages").insert({
            conversation_id: conversationId,

            // Legacy conversation-owner field.
            // This remains the BUSINESS ID.
            user_id: business.id,

            // Actual sender.
            sender_user_id: user.id,

            sender_type: "CUSTOMER",

            content: cleanMessage,
          });

        if (messageError) {
          throw new Error(
            `Message: ${messageError.message}`
          );
        }

        // ---------------------------------------------
        // UPDATE CONVERSATION PREVIEW
        // ---------------------------------------------

        const { error: updateError } =
          await supabase
            .from("conversations")
            .update({
              last_message: cleanMessage,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversationId)
            .eq("customer_id", user.id);

        if (updateError) {
          throw new Error(
            `Conversation update: ${updateError.message}`
          );
        }
      } else {
        // ---------------------------------------------
        // CREATE NEW CONVERSATION
        // ---------------------------------------------

        const {
          data: newConversation,
          error: createError,
        } = await supabase
          .from("conversations")
          .insert({
            // BUSINESS OWNER
            user_id: business.id,

            // CUSTOMER
            customer_id: user.id,

            // CUSTOMER NAME
            customer_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Customer",

            last_message: cleanMessage,

            status: "NEW",
          })
          .select(
            "id, user_id, customer_id, customer_name, last_message, status, created_at, updated_at"
          )
          .single();

        if (createError || !newConversation) {
          throw new Error(
            `Conversation: ${
              createError?.message ||
              "Unable to create conversation."
            }`
          );
        }

        conversationId = newConversation.id;

        // ---------------------------------------------
        // CREATE FIRST CUSTOMER MESSAGE
        // ---------------------------------------------

        const { error: messageError } =
          await supabase.from("messages").insert({
            conversation_id: conversationId,

            // BUSINESS OWNER
            user_id: business.id,

            // ACTUAL CUSTOMER SENDER
            sender_user_id: user.id,

            sender_type: "CUSTOMER",

            content: cleanMessage,
          });

        if (messageError) {
          // Roll back conversation if message fails
          await supabase
            .from("conversations")
            .delete()
            .eq("id", conversationId)
            .eq("customer_id", user.id);

          throw new Error(
            `Message: ${messageError.message}`
          );
        }
      }

      setShowNewConversation(false);
      setSelectedBusiness("");
      setInitialMessage("");

      router.push(
        `/customer/conversations/${conversationId}`
      );
    } catch (err) {
      console.error(
        "CREATE CUSTOMER CONVERSATION ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message."
      );
    } finally {
      setCreating(false);
    }
  }

  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime()
    );
  }, [conversations]);

  if (loading) {
    return (
      <main
        className={
          darkMode
            ? "min-h-screen bg-[#0d0d1a] text-white"
            : "min-h-screen bg-slate-50 text-slate-900"
        }
      >
        <Navbar />

        <div className="flex min-h-screen items-center justify-center pt-[76px]">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your conversations...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-[#0d0d1a] text-white"
          : "min-h-screen bg-slate-50 text-slate-900"
      }
    >
      <Navbar />

      <div className="pt-[76px]">
        <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* HEADER */}
            <header className="mb-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        darkMode
                          ? "rounded-xl bg-indigo-500/10 p-3 text-indigo-400"
                          : "rounded-xl bg-indigo-50 p-3 text-indigo-600"
                      }
                    >
                      <MessageSquare className="h-6 w-6" />
                    </div>

                    <div>
                      <h1
                        className={
                          darkMode
                            ? "text-2xl font-bold text-white"
                            : "text-2xl font-bold text-slate-900"
                        }
                      >
                        My Conversations
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        Chat directly with businesses
                        through ReplyFlow.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={
                      darkMode
                        ? "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                        : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    }
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        refreshing
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewConversation(true)
                    }
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4" />
                    New Conversation
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </header>

            {/* ERROR */}
            {error && (
              <div
                className={
                  darkMode
                    ? "mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    : "mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                }
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 rounded-md p-1"
                  aria-label="Close error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* CONVERSATIONS */}
            <section
              className={
                darkMode
                  ? "overflow-hidden rounded-2xl border border-white/10 bg-[#141827]"
                  : "overflow-hidden rounded-2xl border border-slate-200 bg-white"
              }
            >
              <div
                className={
                  darkMode
                    ? "border-b border-white/10 px-6 py-5"
                    : "border-b border-slate-200 px-6 py-5"
                }
              >
                <h2 className="font-semibold">
                  Your Conversations
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {conversations.length} conversation
                  {conversations.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              {sortedConversations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div
                    className={
                      darkMode
                        ? "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400"
                        : "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
                    }
                  >
                    <MessageSquare className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold">
                    No conversations yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Start a conversation with a business
                    to get assistance.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewConversation(true)
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Start Conversation
                  </button>
                </div>
              ) : (
                <div
                  className={
                    darkMode
                      ? "divide-y divide-white/10"
                      : "divide-y divide-slate-100"
                  }
                >
                  {sortedConversations.map(
                    (conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/customer/conversations/${conversation.id}`
                          )
                        }
                        className={
                          darkMode
                            ? "group flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-white/[0.03]"
                            : "group flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                        }
                      >
                        <div
                          className={
                            darkMode
                              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400"
                              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"
                          }
                        >
                          <Building2 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">
                              Business Support
                            </p>

                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                              {conversation.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {conversation.last_message ||
                              "No message"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              conversation.updated_at
                            )}
                          </p>
                        </div>

                        <ArrowRight className="hidden h-4 w-4 text-slate-400 transition group-hover:translate-x-1 sm:block" />
                      </button>
                    )
                  )}
                </div>
              )}
            </section>

            <div className="mt-5 flex justify-between px-1 text-xs text-slate-500">
              <span>
                Signed in as {userName}
              </span>

              <span>Customer account</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* NEW CONVERSATION MODAL */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className={
              darkMode
                ? "w-full max-w-lg rounded-2xl border border-white/10 bg-[#141827] p-6 shadow-2xl"
                : "w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Start a Conversation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a business and send your
                  message.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowNewConversation(false)
                }
                className={
                  darkMode
                    ? "rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    : "rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                }
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* BUSINESS */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Business
                </label>

                <select
                  value={selectedBusiness}
                  onChange={(event) =>
                    setSelectedBusiness(
                      event.target.value
                    )
                  }
                  className={
                    darkMode
                      ? "w-full rounded-lg border border-white/10 bg-[#1c2235] px-3 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }
                >
                  {/* PLACEHOLDER */}
                  <option
                    value=""
                    className={
                      darkMode
                        ? "bg-[#1c2235] text-slate-400"
                        : "bg-white text-slate-500"
                    }
                  >
                    Select a business
                  </option>

                  {/* BUSINESS OPTIONS */}
                  {businesses.map((business) => (
                    <option
                      key={business.id}
                      value={business.id}
                      className={
                        darkMode
                          ? "bg-[#1c2235] text-white"
                          : "bg-white text-slate-900"
                      }
                    >
                      {business.full_name
                        ? `${business.full_name} — ${business.email}`
                        : business.email}
                    </option>
                  ))}
                </select>

                {/* EMPTY BUSINESS MESSAGE */}
                {businesses.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    No business accounts are currently
                    available.
                  </p>
                )}
              </div>

              {/* MESSAGE */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Your Message
                </label>

                <textarea
                  value={initialMessage}
                  onChange={(event) =>
                    setInitialMessage(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Type your message..."
                  className={
                    darkMode
                      ? "w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowNewConversation(false)
                  }
                  className={
                    darkMode
                      ? "rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
                      : "rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateConversation}
                  disabled={
                    creating ||
                    !selectedBusiness ||
                    !initialMessage.trim()
                  }
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  {creating
                    ? "Sending..."
                    : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Just now";
  }

  if (difference < hour) {
    return `${Math.floor(
      difference / minute
    )}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(
      difference / hour
    )}h ago`;
  }

  if (difference < 7 * day) {
    return `${Math.floor(
      difference / day
    )}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !==
      now.getFullYear()
        ? "numeric"
        : undefined,
  });
}