
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase/client";

type ConversationStatus = "HOT" | "WARM" | "NEW";

export default function NewConversationPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [customerName, setCustomerName] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [status, setStatus] =
    useState<ConversationStatus>("NEW");
  const [aiEnabled, setAiEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDark = resolvedTheme === "dark";

  const handleCreateConversation = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    const cleanName = customerName.trim();
    const cleanMessage = initialMessage.trim();

    if (!cleanName) {
      setErrorMessage("Please enter the customer's name.");
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage(
        "Customer name must contain at least 2 characters."
      );
      return;
    }

    if (!cleanMessage) {
      setErrorMessage(
        "Please enter the customer's initial message."
      );
      return;
    }

    if (cleanMessage.length < 2) {
      setErrorMessage(
        "The initial message must contain at least 2 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: conversation, error: conversationError } =
        await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            customer_name: cleanName,
            last_message: cleanMessage,
            status,
          })
          .select(
            "id, customer_name, last_message, status, created_at, updated_at"
          )
          .single();

      if (conversationError) {
        throw new Error(conversationError.message);
      }

      if (!conversation) {
        throw new Error(
          "Conversation could not be created."
        );
      }

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          sender_type: "CUSTOMER",
          content: cleanMessage,
        });

      if (messageError) {
        await supabase
          .from("conversations")
          .delete()
          .eq("id", conversation.id)
          .eq("user_id", user.id);

        throw new Error(messageError.message);
      }

      void aiEnabled;

      router.push(`/conversations/${conversation.id}`);
    } catch (error) {
      console.error("Create conversation error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Something went wrong while creating the conversation."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-[#0d0d1a] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Navbar />

      <DashboardSidebar />

      <main className="pt-[76px] lg:pl-[260px]">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push("/conversations")}
            className={`mb-6 inline-flex items-center gap-2 text-sm font-medium transition ${
              isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Conversations
          </button>

          {/* Header */}
          <div className="mb-8">
            <div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                isDark
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <MessageSquare className="h-6 w-6" />
            </div>

            <h1
              className={`text-3xl font-bold tracking-tight sm:text-4xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              New Conversation
            </h1>

            <p
              className={`mt-2 max-w-2xl text-sm leading-6 sm:text-base ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Start a new customer conversation and let
              ReplyFlow AI help you manage the interaction.
            </p>
          </div>

          {/* Main layout */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Form card */}
            <div
              className={`rounded-3xl border p-6 shadow-sm sm:p-8 ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <form
                onSubmit={handleCreateConversation}
                className="space-y-7"
              >
                {/* Customer information */}
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-white/5 text-indigo-400"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </div>

                    <div>
                      <h2
                        className={`font-semibold ${
                          isDark
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        Customer Information
                      </h2>

                      <p
                        className={`text-xs ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        Enter the basic customer details.
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="customerName"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    Customer Name
                  </label>

                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                    placeholder="e.g. Sarah Johnson"
                    maxLength={100}
                    disabled={loading}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      isDark
                        ? "border-white/10 bg-[#0d0d1a] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                  />
                </div>

                {/* Initial message */}
                <div>
                  <label
                    htmlFor="initialMessage"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    Initial Message
                  </label>

                  <textarea
                    id="initialMessage"
                    value={initialMessage}
                    onChange={(event) =>
                      setInitialMessage(event.target.value)
                    }
                    placeholder="Enter the customer's first message..."
                    rows={7}
                    maxLength={2000}
                    disabled={loading}
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${
                      isDark
                        ? "border-white/10 bg-[#0d0d1a] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                  />

                  <div
                    className={`mt-2 text-right text-xs ${
                      isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    {initialMessage.length}/2000
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    Conversation Status
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as ConversationStatus
                      )
                    }
                    disabled={loading}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      isDark
                        ? "border-white/10 bg-[#0d0d1a] text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                  >
                    <option value="NEW">New</option>
                    <option value="WARM">Warm</option>
                    <option value="HOT">Hot</option>
                  </select>

                  <p
                    className={`mt-2 text-xs ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    You can change this status later based
                    on the customer's interest.
                  </p>
                </div>

                {/* AI toggle */}
                <div
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
                    isDark
                      ? "border-white/10 bg-white/[0.025]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isDark
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        Enable AI Assistance
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        Allow ReplyFlow AI to assist with
                        replies in this conversation.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={aiEnabled}
                    aria-label="Enable AI assistance"
                    disabled={loading}
                    onClick={() =>
                      setAiEnabled((current) => !current)
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      aiEnabled
                        ? "bg-indigo-600"
                        : isDark
                        ? "bg-slate-700"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        aiEnabled
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Error */}
                {errorMessage && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      isDark
                        ? "border-red-500/20 bg-red-500/10 text-red-300"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Buttons */}
                <div
                  className={`flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end ${
                    isDark
                      ? "border-white/10"
                      : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/conversations")
                    }
                    disabled={loading}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark
                        ? "text-slate-300 hover:bg-white/5 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Create Conversation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Information card */}
            <aside className="space-y-6">
              <div
                className={`rounded-3xl border p-6 ${
                  isDark
                    ? "border-indigo-500/20 bg-indigo-500/[0.06]"
                    : "border-indigo-100 bg-indigo-50/70"
                }`}
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                    isDark
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white text-indigo-600"
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                </div>

                <h3
                  className={`font-semibold ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  How ReplyFlow works
                </h3>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Start with the customer's message.
                  ReplyFlow will keep the conversation
                  organized and provide AI assistance as
                  the conversation continues.
                </p>

                <div className="mt-5 space-y-4">
                  {[
                    "Create the conversation",
                    "Continue the customer chat",
                    "Generate AI-assisted replies",
                    "Identify potential leads",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isDark
                            ? "text-indigo-400"
                            : "text-indigo-600"
                        }`}
                      />

                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark
                              ? "text-slate-200"
                              : "text-slate-800"
                          }`}
                        >
                          {index + 1}. {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status explanation */}
              <div
                className={`rounded-3xl border p-6 ${
                  isDark
                    ? "border-white/10 bg-[#141827]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h3
                  className={`font-semibold ${
                    isDark
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  Conversation Status
                </h3>

                <div className="mt-5 space-y-4">
                  <StatusInfo
                    label="New"
                    description="A newly started or unqualified conversation."
                    className={
                      isDark
                        ? "bg-slate-500/10 text-slate-300"
                        : "bg-slate-100 text-slate-700"
                    }
                  />

                  <StatusInfo
                    label="Warm"
                    description="The customer has shown some interest."
                    className={
                      isDark
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-amber-50 text-amber-700"
                    }
                  />

                  <StatusInfo
                    label="Hot"
                    description="The customer appears highly interested."
                    className={
                      isDark
                        ? "bg-red-500/10 text-red-300"
                        : "bg-red-50 text-red-700"
                    }
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className="lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}

function StatusInfo({
  label,
  description,
  className,
}: {
  label: string;
  description: string;
  className: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${className}`}
      >
        {label}
      </span>

      <p className="text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}
