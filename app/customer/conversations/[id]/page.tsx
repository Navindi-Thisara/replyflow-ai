"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase/client";

type ConversationStatus = "HOT" | "WARM" | "NEW";

type Conversation = {
  id: string;
  user_id: string;
  customer_id: string;
  customer_name: string;
  last_message: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
};

type MessageSender = "CUSTOMER" | "AI" | "HUMAN";

type Message = {
  id: string;
  conversation_id: string;
  user_id: string;
  sender_user_id: string | null;
  sender_type: MessageSender;
  content: string;
  created_at: string;
};

type BusinessProfile = {
  id: string;
  full_name: string | null;
  email: string;
};

export default function CustomerConversationPage() {
  const router = useRouter();
  const params = useParams();
  const { resolvedTheme } = useTheme();

  const darkMode = resolvedTheme !== "light";

  const conversationId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [business, setBusiness] =
    useState<BusinessProfile | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /*
   * Load conversation.
   */
  const loadConversation = useCallback(
    async () => {
      if (!conversationId) {
        setError("Invalid conversation.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(
            userError.message
          );
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        /*
         * Verify CUSTOMER account.
         */
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name, role"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            `Unable to verify account: ${profileError.message}`
          );
        }

        if (
          !profile ||
          profile.role !== "CUSTOMER"
        ) {
          router.replace("/dashboard");
          return;
        }

        setCustomerName(
          profile.full_name ||
            user.email?.split("@")[0] ||
            "Customer"
        );

        /*
         * Load only the conversation
         * belonging to this customer.
         */
        const {
          data: conversationData,
          error: conversationError,
        } = await supabase
          .from("conversations")
          .select(
            "id, user_id, customer_id, customer_name, last_message, status, created_at, updated_at"
          )
          .eq("id", conversationId)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (conversationError) {
          throw new Error(
            `Conversation: ${conversationError.message}`
          );
        }

        if (!conversationData) {
          setError(
            "Conversation not found or you do not have access to it."
          );
          return;
        }

        setConversation(
          conversationData
        );

        /*
         * Load business profile.
         */
        const {
          data: businessData,
          error: businessError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name, email"
          )
          .eq(
            "id",
            conversationData.user_id
          )
          .maybeSingle();

        if (businessError) {
          console.error(
            "BUSINESS PROFILE ERROR:",
            businessError
          );
        }

        setBusiness(
          businessData ?? null
        );

        /*
         * Load all messages in this
         * accessible conversation.
         *
         * RLS determines access.
         */
        const {
          data: messageData,
          error: messagesError,
        } = await supabase
          .from("messages")
          .select(
            "id, conversation_id, user_id, sender_user_id, sender_type, content, created_at"
          )
          .eq(
            "conversation_id",
            conversationId
          )
          .order("created_at", {
            ascending: true,
          });

        if (messagesError) {
          throw new Error(
            `Messages: ${messagesError.message}`
          );
        }

        setMessages(
          messageData ?? []
        );
      } catch (err) {
        console.error(
          "CUSTOMER CONVERSATION ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load conversation."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [conversationId, router]
  );

  /*
   * Initial load.
   */
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  /*
   * Refresh.
   */
  async function handleRefresh() {
    setRefreshing(true);
    await loadConversation();
  }

  /*
   * Send customer message.
   */
  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanMessage =
      message.trim();

    if (!cleanMessage) {
      return;
    }

    if (!conversation) {
      setError(
        "Conversation is not available."
      );
      return;
    }

    try {
      setError("");
      setSending(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /*
       * Customer message:
       *
       * user_id
       * = BUSINESS owner
       *
       * sender_user_id
       * = actual CUSTOMER
       *
       * sender_type
       * = CUSTOMER
       */
      const {
        data: newMessage,
        error: messageError,
      } = await supabase
        .from("messages")
        .insert({
          conversation_id:
            conversation.id,

          // Conversation owner
          user_id:
            conversation.user_id,

          // Actual sender
          sender_user_id:
            user.id,

          sender_type:
            "CUSTOMER",

          content:
            cleanMessage,
        })
        .select(
          "id, conversation_id, user_id, sender_user_id, sender_type, content, created_at"
        )
        .single();

      if (messageError) {
        throw new Error(
          `Unable to send message: ${messageError.message}`
        );
      }

      /*
       * Add message immediately to UI.
       */
      if (newMessage) {
        setMessages(
          (current) => [
            ...current,
            newMessage,
          ]
        );
      }

      /*
       * Update conversation preview.
       */
      const {
        error: updateError,
      } = await supabase
        .from("conversations")
        .update({
          last_message:
            cleanMessage,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          conversation.id
        )
        .eq(
          "customer_id",
          user.id
        );

      if (updateError) {
        console.error(
          "CONVERSATION UPDATE ERROR:",
          updateError
        );
      }

      setConversation(
        (current) =>
          current
            ? {
                ...current,
                last_message:
                  cleanMessage,
                updated_at:
                  new Date().toISOString(),
              }
            : current
      );

      setMessage("");
    } catch (err) {
      console.error(
        "SEND MESSAGE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message."
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * Group messages by date.
   */
  const groupedMessages =
    useMemo(() => {
      const groups: {
        date: string;
        messages: Message[];
      }[] = [];

      messages.forEach(
        (currentMessage) => {
          const dateKey =
            formatMessageDate(
              currentMessage.created_at
            );

          const existing =
            groups.find(
              (group) =>
                group.date ===
                dateKey
            );

          if (existing) {
            existing.messages.push(
              currentMessage
            );
          } else {
            groups.push({
              date: dateKey,
              messages: [
                currentMessage,
              ],
            });
          }
        }
      );

      return groups;
    }, [messages]);

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

        <div className="flex min-h-[calc(100vh-76px)] items-center justify-center pt-[76px]">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading conversation...
          </div>
        </div>
      </main>
    );
  }

  /*
   * Conversation unavailable.
   */
  if (!conversation) {
    return (
      <main
        className={
          darkMode
            ? "min-h-screen bg-[#0d0d1a] text-white"
            : "min-h-screen bg-slate-50 text-slate-900"
        }
      >
        <Navbar />

        <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-6 pt-[76px]">
          <div className="w-full max-w-md text-center">
            <div
              className={
                darkMode
                  ? "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400"
                  : "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"
              }
            >
              <MessageSquare className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-lg font-semibold">
              Conversation unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "This conversation could not be found."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/customer/conversations"
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Conversations
            </button>
          </div>
        </div>
      </main>
    );
  }

  const businessName =
    business?.full_name ||
    business?.email ||
    "Business Support";

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
        <div className="px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">

            {/* TOP BAR */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/customer/conversations"
                  )
                }
                className={
                  darkMode
                    ? "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                    : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                }
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className={
                  darkMode
                    ? "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                    : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
            </div>

            {/* ERROR */}
            {error && (
              <div
                className={
                  darkMode
                    ? "mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    : "mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                }
              >
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="shrink-0 rounded-md p-1 transition hover:bg-red-500/10"
                  aria-label="Close error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* CONVERSATION HEADER */}
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
                    ? "flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6"
                    : "flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6"
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* BUSINESS AVATAR */}
                  <div
                    className={
                      darkMode
                        ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400"
                        : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"
                    }
                  >
                    <Building2 className="h-5 w-5" />
                  </div>

                  {/* BUSINESS INFO */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1
                        className={
                          darkMode
                            ? "truncate font-semibold text-white"
                            : "truncate font-semibold text-slate-900"
                        }
                      >
                        {businessName}
                      </h1>

                      <StatusBadge
                        status={
                          conversation.status
                        }
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Business Support
                    </p>
                  </div>
                </div>

                {/* CUSTOMER INDICATOR */}
                <div className="hidden items-center gap-2 text-right sm:flex">
                  <div>
                    <p className="text-xs text-slate-400">
                      Signed in as
                    </p>

                    <p
                      className={
                        darkMode
                          ? "text-sm font-medium text-slate-200"
                          : "text-sm font-medium text-slate-700"
                      }
                    >
                      {customerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* CHAT */}
              <div
                className={
                  darkMode
                    ? "min-h-[480px] bg-[#0f1320] px-4 py-6 sm:px-6"
                    : "min-h-[480px] bg-slate-50/70 px-4 py-6 sm:px-6"
                }
              >
                {groupedMessages.length ===
                0 ? (
                  <div className="flex min-h-[420px] items-center justify-center">
                    <div className="text-center">
                      <div
                        className={
                          darkMode
                            ? "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400"
                            : "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
                        }
                      >
                        <MessageSquare className="h-7 w-7" />
                      </div>

                      <p className="mt-4 text-sm font-medium">
                        No messages yet
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Send a message to start the conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-7">
                    {groupedMessages.map(
                      (group) => (
                        <div
                          key={group.date}
                        >
                          {/* DATE */}
                          <div className="mb-5 flex items-center justify-center">
                            <span
                              className={
                                darkMode
                                  ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-500"
                                  : "rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-400"
                              }
                            >
                              {group.date}
                            </span>
                          </div>

                          <div className="space-y-4">
                            {group.messages.map(
                              (
                                currentMessage
                              ) => {
                                const isCustomer =
                                  currentMessage.sender_type ===
                                  "CUSTOMER";

                                return (
                                  <MessageBubble
                                    key={
                                      currentMessage.id
                                    }
                                    message={
                                      currentMessage
                                    }
                                    isCustomer={
                                      isCustomer
                                    }
                                    customerName={
                                      customerName
                                    }
                                    businessName={
                                      businessName
                                    }
                                    darkMode={
                                      darkMode
                                    }
                                  />
                                );
                              }
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* COMPOSER */}
              <div
                className={
                  darkMode
                    ? "border-t border-white/10 bg-[#141827] p-4 sm:p-5"
                    : "border-t border-slate-200 bg-white p-4 sm:p-5"
                }
              >
                <form
                  onSubmit={
                    handleSendMessage
                  }
                >
                  <div
                    className={
                      darkMode
                        ? "rounded-xl border border-white/10 bg-white/5 p-2"
                        : "rounded-xl border border-slate-200 bg-slate-50 p-2"
                    }
                  >
                    <textarea
                      value={message}
                      onChange={(
                        event
                      ) =>
                        setMessage(
                          event.target.value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();

                          if (
                            !sending &&
                            message.trim()
                          ) {
                            event.currentTarget.form?.requestSubmit();
                          }
                        }
                      }}
                      rows={3}
                      placeholder="Write a message..."
                      disabled={sending}
                      className={
                        darkMode
                          ? "w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
                          : "w-full resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
                      }
                    />

                    <div className="flex items-center justify-between gap-3 px-2 pb-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        Business replies may be assisted by ReplyFlow AI.
                      </div>

                      <button
                        type="submit"
                        disabled={
                          sending ||
                          !message.trim()
                        }
                        className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}

                        {sending
                          ? "Sending..."
                          : "Send"}
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 px-1 text-[11px] text-slate-500">
                    Press Enter to send · Shift + Enter for a new line
                  </p>
                </form>
              </div>
            </section>

            {/* FOOTER INFO */}
            <div className="mt-4 flex items-center justify-between px-1 text-xs text-slate-500">
              <span>
                {messages.length} message
                {messages.length !== 1
                  ? "s"
                  : ""}
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Secure conversation
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/* -------------------------------- */
/* Message Bubble                   */
/* -------------------------------- */

function MessageBubble({
  message,
  isCustomer,
  customerName,
  businessName,
  darkMode,
}: {
  message: Message;
  isCustomer: boolean;
  customerName: string;
  businessName: string;
  darkMode: boolean;
}) {
  const senderName = isCustomer
    ? customerName
    : message.sender_type === "AI"
      ? "ReplyFlow AI"
      : businessName;

  return (
    <div
      className={`flex ${
        isCustomer
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[88%] items-end gap-2 sm:max-w-[75%] ${
          isCustomer
            ? "flex-row-reverse"
            : "flex-row"
        }`}
      >
        {/* AVATAR */}
        <div
          className={
            isCustomer
              ? darkMode
                ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-semibold text-indigo-400"
                : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600"
              : darkMode
                ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-indigo-400"
                : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600"
          }
        >
          {message.sender_type ===
          "AI" ? (
            <Sparkles className="h-3.5 w-3.5" />
          ) : (
            getInitials(senderName)
          )}
        </div>

        {/* MESSAGE */}
        <div>
          <div
            className={`mb-1 flex items-center gap-2 ${
              isCustomer
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <span className="text-[10px] font-medium text-slate-400">
              {senderName}
            </span>

            {message.sender_type ===
              "AI" && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-medium text-indigo-400">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </span>
            )}
          </div>

          <div
            className={
              isCustomer
                ? "rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm text-white shadow-sm"
                : darkMode
                  ? "rounded-2xl rounded-bl-md border border-white/10 bg-[#1a2030] px-4 py-3 text-sm text-slate-200 shadow-sm"
                  : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
            }
          >
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          <div
            className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${
              isCustomer
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <Clock3 className="h-3 w-3" />

            {formatTime(
              message.created_at
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Status Badge                     */
/* -------------------------------- */

function StatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  const styles = {
    HOT: "border-red-500/20 bg-red-500/10 text-red-400",
    WARM: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    NEW: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`w-fit shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* -------------------------------- */
/* Helpers                          */
/* -------------------------------- */

function getInitials(
  name: string
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function formatTime(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatMessageDate(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const now = new Date();

  const today =
    date.toDateString() ===
    now.toDateString();

  if (today) {
    return "Today";
  }

  const yesterday = new Date(
    now
  );

  yesterday.setDate(
    now.getDate() - 1
  );

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !==
        now.getFullYear()
          ? "numeric"
          : undefined,
    }
  );
}