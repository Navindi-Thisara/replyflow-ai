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
  Bot,
  Check,
  Clock3,
  Loader2,
  MessageSquare,
  MoreVertical,
  Send,
  Sparkles,
  User,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "next-themes";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase/client";

type ConversationStatus = "HOT" | "WARM" | "NEW";

type Conversation = {
  id: string;
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
  sender_type: MessageSender;
  content: string;
  created_at: string;
};

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const conversationId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;


  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // CONVERSATION STATE

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [messageText, setMessageText] = useState("");

 
  const [messageSource, setMessageSource] =
    useState<"HUMAN" | "AI">("HUMAN");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  
  // LEAD STATE

  const [isLead, setIsLead] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);

  // AI REPLY STATE

  const [aiReply, setAiReply] = useState("");
  const [generatingReply, setGeneratingReply] =
    useState(false);

  // LOAD CONVERSATION

  const loadConversation = useCallback(
    async (showLoader = true) => {
      if (!conversationId) {
        setErrorMessage("Conversation ID is missing.");
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage("");

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

        // LOAD CONVERSATION

        const {
          data: conversationData,
          error: conversationError,
        } = await supabase
          .from("conversations")
          .select(
            "id, customer_name, last_message, status, created_at, updated_at"
          )
          .eq("id", conversationId)
          .eq("user_id", user.id)
          .single();

        if (conversationError) {
          throw new Error(conversationError.message);
        }

        if (!conversationData) {
          throw new Error(
            "Conversation could not be found."
          );
        }

        // LOAD MESSAGES

        const {
          data: messageData,
          error: messageError,
        } = await supabase
          .from("messages")
          .select(
            "id, conversation_id, user_id, sender_type, content, created_at"
          )
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          });

        if (messageError) {
          throw new Error(messageError.message);
        }

        // CHECK WHETHER THIS CONVERSATION IS ALREADY A LEAD

        const {
          data: existingLead,
          error: leadError,
        } = await supabase
          .from("leads")
          .select("id")
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (leadError) {
          throw new Error(leadError.message);
        }

        setConversation(
          conversationData as Conversation
        );

        setMessages(
          (messageData ?? []) as Message[]
        );

        setIsLead(Boolean(existingLead));

        setAiReply("");

        setMessageSource("HUMAN");
      } catch (error) {
        console.error(
          "Load conversation error:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Unable to load this conversation."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [conversationId, router]
  );

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // GROUP MESSAGES BY DATE

  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};

    messages.forEach((message) => {
      const date = new Date(
        message.created_at
      ).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(message);
    });

    return groups;
  }, [messages]);

  // CREATE LEAD

  const handleCreateLead = async () => {
    if (!conversation || creatingLead || isLead) {
      return;
    }

    setCreatingLead(true);
    setErrorMessage("");

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

      const {
        data: existingLead,
        error: existingLeadError,
      } = await supabase
        .from("leads")
        .select("id")
        .eq("conversation_id", conversation.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingLeadError) {
        throw new Error(
          existingLeadError.message
        );
      }

      if (existingLead) {
        setIsLead(true);
        return;
      }

      const { error: leadInsertError } =
        await supabase
          .from("leads")
          .insert({
            user_id: user.id,
            conversation_id: conversation.id,
            status: "NEW",
          });

      if (leadInsertError) {
        throw new Error(
          leadInsertError.message
        );
      }

      setIsLead(true);
    } catch (error) {
      console.error(
        "Create lead error:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Unable to create lead."
        );
      }
    } finally {
      setCreatingLead(false);
    }
  };

  // AI REPLY GENERATION

  const handleGenerateAIReply = async () => {
    if (
      generatingReply ||
      messages.length === 0 ||
      !conversation
    ) {
      return;
    }

    setGeneratingReply(true);
    setErrorMessage("");

    try {
      // LOAD AI PREFERENCES FROM SETTINGS

      const storedTone =
        localStorage.getItem(
          "replyflow_ai_tone"
        );

      const storedReplyLength =
        localStorage.getItem(
          "replyflow_ai_reply_length"
        );

      const tone =
        storedTone === "Professional" ||
        storedTone === "Friendly" ||
        storedTone === "Empathetic" ||
        storedTone === "Concise"
          ? storedTone
          : "Professional";

      const replyLength =
        storedReplyLength === "Short" ||
        storedReplyLength === "Medium" ||
        storedReplyLength === "Detailed"
          ? storedReplyLength
          : "Medium";

      // SEND CONVERSATION + AI PREFERENCES TO API

      const response = await fetch(
        "/api/generate-reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName:
              conversation.customer_name,

            messages: messages.map((message) => ({
              sender_type: message.sender_type,
              content: message.content,
            })),

            tone,

            replyLength,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: {
        reply?: string;
        error?: string;
      };

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "Non-JSON response from API:",
          responseText
        );

        throw new Error(
          `API returned non-JSON response (${response.status}). Check /api/generate-reply and the terminal.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to generate an AI reply."
        );
      }

      setAiReply(data.reply || "");
    } catch (error) {
      console.error(
        "AI reply generation error:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Unable to generate an AI reply."
        );
      }
    } finally {
      setGeneratingReply(false);
    }
  };

  // USE AI REPLY

  const handleUseAIReply = () => {
    if (!aiReply) {
      return;
    }

    setMessageText(aiReply);

    setMessageSource("AI");

    setAiReply("");
  };

  // SEND MESSAGE

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage || sending) {
      return;
    }

    setErrorMessage("");
    setSending(true);

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

      if (!conversation) {
        throw new Error(
          "Conversation is not available."
        );
      }

      const {
        data: newMessage,
        error: messageError,
      } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          sender_type: messageSource,
          content: cleanMessage,
        })
        .select(
          "id, conversation_id, user_id, sender_type, content, created_at"
        )
        .single();

      if (messageError) {
        throw new Error(
          messageError.message
        );
      }

      if (newMessage) {
        setMessages((current) => [
          ...current,
          newMessage as Message,
        ]);
      }

      setMessageText("");

      setMessageSource("HUMAN");

      // UPDATE CONVERSATION LAST MESSAGE

      const {
        data: updatedConversation,
        error: updateError,
      } = await supabase
        .from("conversations")
        .update({
          last_message: cleanMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation.id)
        .eq("user_id", user.id)
        .select(
          "id, customer_name, last_message, status, created_at, updated_at"
        )
        .single();

      if (updateError) {
        console.error(
          "Conversation update error:",
          updateError
        );
      } else if (updatedConversation) {
        setConversation(
          updatedConversation as Conversation
        );
      }
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Unable to send the message."
        );
      }
    } finally {
      setSending(false);
    }
  };


  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getInitials = (name: string) => {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "C";
    }

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  const statusStyles = {
    HOT: isDark
      ? "bg-red-500/10 text-red-300 border-red-500/20"
      : "bg-red-50 text-red-700 border-red-200",

    WARM: isDark
      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
      : "bg-amber-50 text-amber-700 border-amber-200",

    NEW: isDark
      ? "bg-slate-500/10 text-slate-300 border-slate-500/20"
      : "bg-slate-100 text-slate-700 border-slate-200",
  };

  if (loading) {
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
          <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4">
            <div className="flex flex-col items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isDark
                    ? "bg-indigo-500/10"
                    : "bg-indigo-50"
                }`}
              >
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>

              <p
                className={`text-sm ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Loading conversation...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!conversation) {
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
          <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-3xl items-center justify-center px-4">
            <div
              className={`w-full rounded-3xl border p-8 text-center ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isDark
                    ? "bg-red-500/10 text-red-400"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <MessageSquare className="h-6 w-6" />
              </div>

              <h1 className="text-xl font-bold">
                Conversation not found
              </h1>

              <p
                className={`mx-auto mt-2 max-w-md text-sm leading-6 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {errorMessage ||
                  "This conversation may have been removed or you may not have permission to view it."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/conversations")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Conversations
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <div className="flex min-h-[calc(100vh-76px)] flex-col">

          {/* HEADER */}

          <header
            className={`sticky top-[76px] z-20 border-b ${
              isDark
                ? "border-white/10 bg-[#0d0d1a]/95"
                : "border-slate-200 bg-white/95"
            } backdrop-blur`}
          >
            <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/conversations")
                  }
                  aria-label="Back to conversations"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isDark
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div
                  className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:flex ${
                    isDark
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {getInitials(
                    conversation.customer_name
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1
                      className={`truncate text-base font-bold sm:text-lg ${
                        isDark
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {conversation.customer_name}
                    </h1>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        statusStyles[
                          conversation.status
                        ]
                      }`}
                    >
                      {conversation.status}
                    </span>
                  </div>

                  <div
                    className={`mt-0.5 flex items-center gap-1.5 text-xs ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active conversation
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={handleCreateLead}
                  disabled={
                    creatingLead || isLead
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:px-4 ${
                    isLead
                      ? isDark
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {creatingLead ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">
                        Creating...
                      </span>
                    </>
                  ) : isLead ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        Lead Created
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        Create Lead
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadConversation(false)
                  }
                  disabled={refreshing}
                  aria-label="Refresh conversation"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition disabled:opacity-50 ${
                    isDark
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  aria-label="More options"
                  className={`hidden h-10 w-10 items-center justify-center rounded-xl transition sm:flex ${
                    isDark
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* CHAT AREA */}

          <section className="flex flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-4 sm:px-6 lg:px-8">

              {/* AI ASSISTANT */}

              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  isDark
                    ? "border-indigo-500/20 bg-indigo-500/[0.06]"
                    : "border-indigo-100 bg-indigo-50/70"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-indigo-500/15 text-indigo-400"
                          : "bg-white text-indigo-600"
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isDark
                            ? "text-indigo-200"
                            : "text-indigo-900"
                        }`}
                      >
                        ReplyFlow AI
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          isDark
                            ? "text-indigo-300/60"
                            : "text-indigo-700/70"
                        }`}
                      >
                        Generate a suggested reply based
                        on the conversation. Your saved
                        AI preferences will be applied.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAIReply}
                    disabled={
                      generatingReply ||
                      messages.length === 0
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingReply ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate AI Reply
                      </>
                    )}
                  </button>
                </div>

                {aiReply && (
                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      isDark
                        ? "border-white/10 bg-[#141827]"
                        : "border-indigo-100 bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold ${
                          isDark
                            ? "text-indigo-300"
                            : "text-indigo-700"
                        }`}
                      >
                        <Bot className="h-3.5 w-3.5" />
                        AI Suggested Reply
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleGenerateAIReply
                        }
                        disabled={generatingReply}
                        className={`text-xs font-medium transition ${
                          isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {generatingReply
                          ? "Generating..."
                          : "Regenerate"}
                      </button>
                    </div>

                    <p
                      className={`whitespace-pre-wrap text-sm leading-6 ${
                        isDark
                          ? "text-slate-200"
                          : "text-slate-700"
                      }`}
                    >
                      {aiReply}
                    </p>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleUseAIReply}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Use Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MESSAGES */}

              <div className="flex-1 py-8">
                {messages.length === 0 ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                          isDark
                            ? "bg-white/5 text-slate-500"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <MessageSquare className="h-6 w-6" />
                      </div>

                      <h2
                        className={`font-semibold ${
                          isDark
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        No messages yet
                      </h2>

                      <p
                        className={`mt-1 text-sm ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        Start the conversation by
                        sending a message below.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(
                      groupedMessages
                    ).map(
                      ([date, dateMessages]) => (
                        <div key={date}>
                          <div className="mb-6 flex items-center gap-4">
                            <div
                              className={`h-px flex-1 ${
                                isDark
                                  ? "bg-white/10"
                                  : "bg-slate-200"
                              }`}
                            />

                            <span
                              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                                isDark
                                  ? "text-slate-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <Clock3 className="h-3 w-3" />
                              {date}
                            </span>

                            <div
                              className={`h-px flex-1 ${
                                isDark
                                  ? "bg-white/10"
                                  : "bg-slate-200"
                              }`}
                            />
                          </div>

                          <div className="space-y-5">
                            {dateMessages.map(
                              (message) => {
                                const isCustomer =
                                  message.sender_type ===
                                  "CUSTOMER";

                                const isAI =
                                  message.sender_type ===
                                  "AI";

                                const isHuman =
                                  message.sender_type ===
                                  "HUMAN";

                                return (
                                  <div
                                    key={message.id}
                                    className={`flex items-end gap-3 ${
                                      isCustomer
                                        ? "justify-start"
                                        : "justify-end"
                                    }`}
                                  >
                                    {isCustomer && (
                                      <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                          isDark
                                            ? "bg-indigo-500/15 text-indigo-300"
                                            : "bg-indigo-100 text-indigo-700"
                                        }`}
                                      >
                                        {getInitials(
                                          conversation.customer_name
                                        )}
                                      </div>
                                    )}

                                    <div
                                      className={`max-w-[85%] sm:max-w-[70%] ${
                                        isCustomer
                                          ? "items-start"
                                          : "items-end"
                                      } flex flex-col`}
                                    >
                                      <div className="mb-1.5 flex items-center gap-2">
                                        {!isCustomer &&
                                          isAI && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-500">
                                              <Bot className="h-3 w-3" />
                                              AI
                                            </span>
                                          )}

                                        {!isCustomer &&
                                          isHuman && (
                                            <span
                                              className={`text-[10px] font-medium ${
                                                isDark
                                                  ? "text-slate-500"
                                                  : "text-slate-400"
                                              }`}
                                            >
                                              You
                                            </span>
                                          )}

                                        {isCustomer && (
                                          <span
                                            className={`text-[10px] font-medium ${
                                              isDark
                                                ? "text-slate-500"
                                                : "text-slate-400"
                                            }`}
                                          >
                                            {
                                              conversation.customer_name
                                            }
                                          </span>
                                        )}
                                      </div>

                                      <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                          isCustomer
                                            ? isDark
                                              ? "rounded-bl-md bg-[#1a1f32] text-slate-200"
                                              : "rounded-bl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
                                            : isAI
                                            ? "rounded-br-md bg-indigo-600 text-white"
                                            : isDark
                                            ? "rounded-br-md bg-slate-700 text-slate-100"
                                            : "rounded-br-md bg-slate-900 text-white"
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap break-words">
                                          {
                                            message.content
                                          }
                                        </p>
                                      </div>

                                      <div
                                        className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                                          isDark
                                            ? "text-slate-600"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        <span>
                                          {formatTime(
                                            message.created_at
                                          )}
                                        </span>

                                        {!isCustomer && (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </div>
                                    </div>

                                    {!isCustomer && (
                                      <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                          isAI
                                            ? isDark
                                              ? "bg-indigo-500/15 text-indigo-400"
                                              : "bg-indigo-100 text-indigo-600"
                                            : isDark
                                            ? "bg-slate-700 text-slate-300"
                                            : "bg-slate-200 text-slate-700"
                                        }`}
                                      >
                                        {isAI ? (
                                          <Bot className="h-4 w-4" />
                                        ) : (
                                          <User className="h-4 w-4" />
                                        )}
                                      </div>
                                    )}
                                  </div>
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
            </div>

            {/* ERROR */}

            {errorMessage && (
              <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 lg:px-8">
                <div
                  className={`mb-3 rounded-xl border px-4 py-3 text-sm ${
                    isDark
                      ? "border-red-500/20 bg-red-500/10 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {errorMessage}
                </div>
              </div>
            )}

            {/* COMPOSER */}

            <div
              className={`sticky bottom-0 border-t ${
                isDark
                  ? "border-white/10 bg-[#0d0d1a]/95"
                  : "border-slate-200 bg-white/95"
              } backdrop-blur`}
            >
              <div className="mx-auto w-full max-w-[1000px] px-4 py-4 sm:px-6 lg:px-8">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-3"
                >
                  <div className="relative flex-1">
                    <textarea
                      value={messageText}
                      onChange={(event) => {
                        setMessageText(
                          event.target.value
                        );

                        setMessageSource("HUMAN");
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();

                          const form =
                            event.currentTarget.form;

                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }}
                      placeholder="Type your message..."
                      rows={1}
                      maxLength={5000}
                      disabled={sending}
                      className={`max-h-32 min-h-[52px] w-full resize-none rounded-2xl border px-4 py-3.5 pr-16 text-sm leading-6 outline-none transition ${
                        isDark
                          ? "border-white/10 bg-[#141827] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      }`}
                    />

                    <span
                      className={`absolute bottom-3 right-4 text-[10px] ${
                        isDark
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {messageText.length}/5000
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !messageText.trim()
                    }
                    aria-label="Send message"
                    className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between px-1">
                  <p
                    className={`text-[10px] ${
                      isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    Press Enter to send · Shift + Enter
                    for a new line
                  </p>

                  <div
                    className={`hidden items-center gap-1.5 text-[10px] sm:flex ${
                      isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    AI assistance enabled
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}

