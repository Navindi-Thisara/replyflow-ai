"use client";

import {
  Activity,
  Bot,
  MessageSquare,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  status: "HOT" | "WARM" | "NEW";
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  sender_type: "CUSTOMER" | "AI" | "HUMAN";
  created_at: string;
};

type Lead = {
  id: string;
  status: string;
  created_at: string;
};

function isWithinLastDays(
  dateString: string,
  days: number
) {
  const date = new Date(dateString);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  return (
    difference >= 0 &&
    difference <= days * 24 * 60 * 60 * 1000
  );
}

function getDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function normalizeStatus(
  status: string | null | undefined
) {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  // Prevent next-themes hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    mounted && resolvedTheme === "dark";

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [leads, setLeads] =
    useState<Lead[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadAnalytics = async (
    showRefresh = false
  ) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
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

      const [
        conversationsResult,
        messagesResult,
        leadsResult,
      ] = await Promise.all([
        supabase
          .from("conversations")
          .select(
            "id, status, created_at, updated_at"
          )
          .eq("user_id", user.id),

        supabase
          .from("messages")
          .select(
            "id, sender_type, created_at"
          )
          .eq("user_id", user.id),

        supabase
          .from("leads")
          .select(
            "id, status, created_at"
          )
          .eq("user_id", user.id),
      ]);

      if (conversationsResult.error) {
        throw conversationsResult.error;
      }

      if (messagesResult.error) {
        throw messagesResult.error;
      }

      if (leadsResult.error) {
        throw leadsResult.error;
      }

      setConversations(
        (conversationsResult.data ||
          []) as Conversation[]
      );

      setMessages(
        (messagesResult.data ||
          []) as Message[]
      );

      setLeads(
        (leadsResult.data ||
          []) as Lead[]
      );
    } catch (error) {
      console.error(
        "Load analytics error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const aiReplies = messages.filter(
      (message) =>
        message.sender_type === "AI"
    ).length;

    const humanReplies = messages.filter(
      (message) =>
        message.sender_type === "HUMAN"
    ).length;

    const hotConversations =
      conversations.filter(
        (conversation) =>
          normalizeStatus(
            conversation.status
          ) === "HOT"
      ).length;

    const convertedLeads =
      leads.filter(
        (lead) =>
          normalizeStatus(
            lead.status
          ) === "CONVERTED"
      ).length;

    /*
     * Conversion Rate:
     * Converted Leads / Total Leads
     *
     * This measures how many created leads
     * eventually became converted leads.
     */
    const conversionRate =
      leads.length > 0
        ? (convertedLeads / leads.length) *
          100
        : 0;

    const aiReplyRate =
      messages.length > 0
        ? (aiReplies / messages.length) *
          100
        : 0;

    return {
      aiReplies,
      humanReplies,
      hotConversations,
      convertedLeads,
      conversionRate,
      aiReplyRate,
    };
  }, [
    conversations,
    messages,
    leads,
  ]);

  const activity = useMemo(() => {
    const today = new Date();

    const days: {
      date: Date;
      label: string;
      conversationCount: number;
      messageCount: number;
    }[] = [];

    for (
      let index = 6;
      index >= 0;
      index--
    ) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(
        today.getDate() - index
      );

      const key = getDayKey(date);

      const conversationCount =
        conversations.filter(
          (conversation) => {
            const conversationDate =
              new Date(
                conversation.created_at
              );

            return (
              getDayKey(
                conversationDate
              ) === key
            );
          }
        ).length;

      const messageCount =
        messages.filter((message) => {
          const messageDate =
            new Date(
              message.created_at
            );

          return (
            getDayKey(
              messageDate
            ) === key
          );
        }).length;

      days.push({
        date,
        label: date.toLocaleDateString(
          undefined,
          {
            weekday: "short",
          }
        ),
        conversationCount,
        messageCount,
      });
    }

    return days;
  }, [conversations, messages]);

  const maxActivity = Math.max(
    1,
    ...activity.map(
      (item) =>
        item.conversationCount +
        item.messageCount
    )
  );

  const last7DaysMessages =
    messages.filter((message) =>
      isWithinLastDays(
        message.created_at,
        7
      )
    ).length;

  const last7DaysConversations =
    conversations.filter(
      (conversation) =>
        isWithinLastDays(
          conversation.created_at,
          7
        )
    ).length;

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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isDark
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <Activity size={20} />
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Analytics
                </h1>
              </div>

              <p
                className={
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }
              >
                Understand your conversations,
                AI activity, and lead
                performance.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadAnalytics(true)
              }
              disabled={refreshing}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                isDark
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="text-sm">
                {errorMessage}
              </div>
            </div>
          )}

          {loading ? (
            <div
              className={`flex min-h-[400px] items-center justify-center rounded-2xl border ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex items-center gap-3 text-sm ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                <RefreshCw
                  size={20}
                  className="animate-spin"
                />
                Loading analytics...
              </div>
            </div>
          ) : (
            <>
              {/* Main stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                  title="Total Conversations"
                  value={
                    conversations.length
                  }
                  description={`${last7DaysConversations} in the last 7 days`}
                  icon={
                    <MessageSquare
                      size={20}
                    />
                  }
                  isDark={isDark}
                />

                <StatCard
                  title="AI Replies"
                  value={stats.aiReplies}
                  description={`${stats.aiReplyRate.toFixed(
                    1
                  )}% of all messages`}
                  icon={
                    <Bot size={20} />
                  }
                  isDark={isDark}
                />

                <StatCard
                  title="Total Leads"
                  value={leads.length}
                  description={`${stats.hotConversations} hot conversations`}
                  icon={
                    <Users size={20} />
                  }
                  isDark={isDark}
                />

                <StatCard
                  title="Conversion Rate"
                  value={`${stats.conversionRate.toFixed(
                    1
                  )}%`}
                  description={`${stats.convertedLeads} converted leads`}
                  icon={
                    <Target size={20} />
                  }
                  isDark={isDark}
                />
              </div>

              {/* Activity */}
              <div className="mb-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">

                <section
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-white/10 bg-[#141827]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">
                        7-Day Activity
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Conversations and
                        messages over the
                        last week.
                      </p>
                    </div>

                    <TrendingUp
                      size={20}
                      className={
                        isDark
                          ? "text-indigo-300"
                          : "text-indigo-600"
                      }
                    />
                  </div>

                  <div className="flex h-64 items-end gap-3">
                    {activity.map(
                      (item) => {
                        const total =
                          item.conversationCount +
                          item.messageCount;

                        const height =
                          total === 0
                            ? 4
                            : Math.max(
                                8,
                                (total /
                                  maxActivity) *
                                  100
                              );

                        return (
                          <div
                            key={item.date.toISOString()}
                            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                          >
                            <span className="text-[10px] text-slate-500">
                              {total}
                            </span>

                            <div
                              className={`w-full max-w-12 rounded-t-xl transition-all ${
                                isDark
                                  ? "bg-indigo-500/70"
                                  : "bg-indigo-500"
                              }`}
                              style={{
                                height: `${height}%`,
                              }}
                              title={`${item.conversationCount} conversations, ${item.messageCount} messages`}
                            />

                            <span className="text-xs text-slate-500">
                              {item.label}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>

                {/* AI Performance */}
                <section
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-white/10 bg-[#141827]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Zap size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        AI Performance
                      </h2>

                      <p className="text-xs text-slate-500">
                        ReplyFlow AI activity
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <Metric
                      label="AI replies"
                      value={
                        stats.aiReplies
                      }
                      total={
                        messages.length
                      }
                      isDark={isDark}
                    />

                    <Metric
                      label="Human replies"
                      value={
                        stats.humanReplies
                      }
                      total={
                        messages.length
                      }
                      isDark={isDark}
                    />

                    <Metric
                      label="Messages this week"
                      value={
                        last7DaysMessages
                      }
                      total={
                        messages.length
                      }
                      isDark={isDark}
                    />
                  </div>
                </section>
              </div>

              {/* Status overview */}
              <div className="grid gap-6 lg:grid-cols-2">

                {/* Conversation Status */}
                <section
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-white/10 bg-[#141827]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">
                        Conversation Status
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Customer conversation
                        distribution
                      </p>
                    </div>

                    <MessageSquare
                      size={19}
                      className={
                        isDark
                          ? "text-indigo-300"
                          : "text-indigo-600"
                      }
                    />
                  </div>

                  <StatusRow
                    label="Hot"
                    value={
                      conversations.filter(
                        (item) =>
                          normalizeStatus(
                            item.status
                          ) === "HOT"
                      ).length
                    }
                    total={
                      conversations.length
                    }
                    isDark={isDark}
                  />

                  <StatusRow
                    label="Warm"
                    value={
                      conversations.filter(
                        (item) =>
                          normalizeStatus(
                            item.status
                          ) === "WARM"
                      ).length
                    }
                    total={
                      conversations.length
                    }
                    isDark={isDark}
                  />

                  <StatusRow
                    label="New"
                    value={
                      conversations.filter(
                        (item) =>
                          normalizeStatus(
                            item.status
                          ) === "NEW"
                      ).length
                    }
                    total={
                      conversations.length
                    }
                    isDark={isDark}
                  />
                </section>

                {/* Lead Status */}
                <section
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-white/10 bg-[#141827]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">
                        Lead Status
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Lead pipeline
                        distribution
                      </p>
                    </div>

                    <Target
                      size={19}
                      className={
                        isDark
                          ? "text-indigo-300"
                          : "text-indigo-600"
                      }
                    />
                  </div>

                  {[
                    "NEW",
                    "CONTACTED",
                    "QUALIFIED",
                    "CONVERTED",
                  ].map((status) => (
                    <StatusRow
                      key={status}
                      label={
                        status.charAt(
                          0
                        ) +
                        status
                          .slice(1)
                          .toLowerCase()
                      }
                      value={
                        leads.filter(
                          (lead) =>
                            normalizeStatus(
                              lead.status
                            ) ===
                            status
                        ).length
                      }
                      total={leads.length}
                      isDark={isDark}
                    />
                  ))}
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      <div className="lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  isDark,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDark
          ? "border-white/10 bg-[#141827]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDark
              ? "bg-indigo-500/15 text-indigo-300"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {icon}
        </div>

        <TrendingUp
          size={17}
          className="text-slate-400"
        />
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  total,
  isDark,
}: {
  label: string;
  value: number;
  total: number;
  isDark: boolean;
}) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span
          className={
            isDark
              ? "text-slate-300"
              : "text-slate-600"
          }
        >
          {label}
        </span>

        <span className="font-semibold">
          {value}
        </span>
      </div>

      <div
        className={`h-2 overflow-hidden rounded-full ${
          isDark
            ? "bg-white/10"
            : "bg-slate-100"
        }`}
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  total,
  isDark,
}: {
  label: string;
  value: number;
  total: number;
  isDark: boolean;
}) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`text-sm ${
            isDark
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          {label}
        </span>

        <span className="text-sm font-semibold">
          {value}
        </span>
      </div>

      <div
        className={`h-2 overflow-hidden rounded-full ${
          isDark
            ? "bg-white/10"
            : "bg-slate-100"
        }`}
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

