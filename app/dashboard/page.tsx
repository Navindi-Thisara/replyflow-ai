"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  MessageSquare,
  Users,
  TrendingUp,
  LogOut,
  Loader2,
  RefreshCw,
  Menu,
} from "lucide-react";
import { useTheme } from "next-themes";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  customer_name: string;
  last_message: string | null;
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
  created_at: string;
};

type DashboardData = {
  conversations: Conversation[];
  messages: Message[];
  leads: Lead[];
};

export default function Dashboard() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const darkMode = resolvedTheme !== "light";

  const [data, setData] = useState<DashboardData>({
    conversations: [],
    messages: [],
    leads: [],
  });

  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  async function loadDashboard() {
    try {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("AUTH ERROR:", userError);

        setError(
          `Authentication error: ${userError.message}`
        );

        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "there";

      setUserName(fullName);

      console.log("CURRENT USER ID:", user.id);
      console.log("CURRENT USER EMAIL:", user.email);

      const [conversationResult, messageResult, leadResult] =
        await Promise.all([
          supabase
            .from("conversations")
            .select(
              "id, customer_name, last_message, status, created_at, updated_at"
            )
            .eq("user_id", user.id)
            .order("updated_at", {
              ascending: false,
            }),

          supabase
            .from("messages")
            .select(
              "id, sender_type, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("leads")
            .select(
              "id, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),
        ]);

      console.log(
        "CONVERSATIONS:",
        conversationResult
      );

      console.log(
        "MESSAGES:",
        messageResult
      );

      console.log(
        "LEADS:",
        leadResult
      );

      if (conversationResult.error) {
        throw new Error(
          `Conversations: ${conversationResult.error.message}`
        );
      }

      if (messageResult.error) {
        throw new Error(
          `Messages: ${messageResult.error.message}`
        );
      }

      if (leadResult.error) {
        throw new Error(
          `Leads: ${leadResult.error.message}`
        );
      }

      setData({
        conversations:
          conversationResult.data ?? [],

        messages:
          messageResult.data ?? [],

        leads:
          leadResult.data ?? [],
      });
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
  }

  async function handleLogout() {
    setError("");

    const {
      error: logoutError,
    } = await supabase.auth.signOut();

    if (logoutError) {
      console.error(
        "LOGOUT ERROR:",
        logoutError
      );

      setError(
        `Logout failed: ${logoutError.message}`
      );

      return;
    }

    router.replace("/login");
    router.refresh();
  }

  const stats = useMemo(() => {
    const messages = data.messages;
    const leads = data.leads;
    const conversations =
      data.conversations;

    const aiReplies = messages.filter(
      (message) =>
        message.sender_type === "AI"
    ).length;

    const conversion =
      conversations.length > 0
        ? (
            (leads.length /
              conversations.length) *
            100
          ).toFixed(1)
        : "0.0";

    return [
      {
        title: "Messages",
        value:
          messages.length.toLocaleString(),
        icon: MessageSquare,
      },
      {
        title: "Leads",
        value:
          leads.length.toLocaleString(),
        icon: Users,
      },
      {
        title: "AI Replies",
        value:
          aiReplies.toLocaleString(),
        icon: Bot,
      },
      {
        title: "Conversion",
        value: `${conversion}%`,
        icon: TrendingUp,
      },
    ];
  }, [data]);

  const aiReplies = data.messages.filter(
    (message) =>
      message.sender_type === "AI"
  ).length;

  const aiResponseRate =
    data.messages.length > 0
      ? Math.round(
          (aiReplies /
            data.messages.length) *
            100
        )
      : 0;

  const chartData = useMemo(() => {
    const today = new Date();

    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(today);

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          today.getDate() -
            (6 - index)
        );

        const nextDate =
          new Date(date);

        nextDate.setDate(
          date.getDate() + 1
        );

        const count =
          data.messages.filter(
            (message) => {
              const messageDate =
                new Date(
                  message.created_at
                );

              return (
                messageDate >= date &&
                messageDate <
                  nextDate
              );
            }
          ).length;

        return {
          date,
          count,
          label:
            date.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            ),
        };
      }
    );
  }, [data.messages]);

  const maxChartValue = Math.max(
    ...chartData.map(
      (item) => item.count
    ),
    1
  );

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

        <DashboardSidebar />

        <div className="pt-[76px] lg:pl-[260px]">
          <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-6">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading dashboard...
            </div>
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
      {/* Main top navbar */}
      <Navbar />

      {/* Dashboard sidebar */}
      <DashboardSidebar
        mobileOpen={
          mobileSidebarOpen
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Main dashboard area */}
      <div className="pt-[76px] lg:pl-[260px]">
        <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div className="flex items-start gap-3">

                  {/* Mobile sidebar button */}
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSidebarOpen(
                        true
                      )
                    }
                    aria-label="Open dashboard navigation"
                    className={
                      darkMode
                        ? "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 lg:hidden"
                        : "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 lg:hidden"
                    }
                  >
                    <Menu className="h-5 w-5" />
                  </button>

                  <div>
                    <h1
                      className={
                        darkMode
                          ? "text-2xl font-bold text-white"
                          : "text-2xl font-bold text-slate-900"
                      }
                    >
                      Good morning,{" "}
                      {userName} 👋
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Here&apos;s what&apos;s
                      happening with your
                      business today.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  {/* Refresh */}
                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className={
                      darkMode
                        ? "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>

                </div>
              </div>
            </header>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Statistics */}
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon =
                  stat.icon;

                return (
                  <div
                    key={
                      stat.title
                    }
                    className={
                      darkMode
                        ? "rounded-2xl border border-white/10 bg-[#141827] p-5 shadow-sm"
                        : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    }
                  >
                    <div className="flex items-center justify-between">

                      <p className="text-sm text-slate-500">
                        {stat.title}
                      </p>

                      <div
                        className={
                          darkMode
                            ? "rounded-lg bg-indigo-500/10 p-2 text-indigo-400"
                            : "rounded-lg bg-indigo-50 p-2 text-indigo-600"
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                    </div>

                    <p
                      className={
                        darkMode
                          ? "mt-4 text-3xl font-bold text-white"
                          : "mt-4 text-3xl font-bold text-slate-900"
                      }
                    >
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Main content */}
            <section className="mt-8 grid gap-6 lg:grid-cols-3">

              {/* Message Activity */}
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-white/10 bg-[#141827] p-6 lg:col-span-2"
                    : "rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2"
                }
              >
                <div className="flex items-center justify-between">

                  <div>
                    <h2
                      className={
                        darkMode
                          ? "font-semibold text-white"
                          : "font-semibold text-slate-900"
                      }
                    >
                      Message Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Customer messages over the last 7 days
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    Last 7 days
                  </span>

                </div>

                <div className="mt-8 flex h-64 items-end gap-3 sm:gap-4">
                  {chartData.map(
                    (item) => {
                      const height =
                        item.count ===
                        0
                          ? 4
                          : Math.max(
                              (item.count /
                                maxChartValue) *
                                100,
                              8
                            );

                      return (
                        <div
                          key={item.date.toISOString()}
                          className="flex h-full flex-1 flex-col items-center gap-3"
                        >
                          <span className="text-xs text-slate-500">
                            {
                              item.count
                            }
                          </span>

                          <div className="flex h-full w-full items-end">
                            <div
                              className="w-full rounded-t-lg bg-indigo-500 transition-all duration-500"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs text-slate-400">
                            {
                              item.label
                            }
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* AI Performance */}
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-white">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
                    <Bot className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      AI Performance
                    </h2>

                    <p className="text-xs text-slate-400">
                      Based on your messages
                    </p>
                  </div>

                </div>

                <div className="mt-8 space-y-6">

                  <Metric
                    label="AI handled"
                    value={aiReplies.toLocaleString()}
                  />

                  <Metric
                    label="AI response rate"
                    value={`${aiResponseRate}%`}
                  />

                  <Metric
                    label="Total messages"
                    value={data.messages.length.toLocaleString()}
                  />

                  <Metric
                    label="Leads identified"
                    value={data.leads.length.toLocaleString()}
                  />

                </div>
              </div>
            </section>

            {/* Recent Conversations */}
            <section
              className={
                darkMode
                  ? "mt-8 rounded-2xl border border-white/10 bg-[#141827]"
                  : "mt-8 rounded-2xl border border-slate-200 bg-white"
              }
            >

              <div
                className={
                  darkMode
                    ? "border-b border-white/10 p-6"
                    : "border-b border-slate-200 p-6"
                }
              >
                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h2
                      className={
                        darkMode
                          ? "font-semibold text-white"
                          : "font-semibold text-slate-900"
                      }
                    >
                      Recent Conversations
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Latest customer interactions
                    </p>
                  </div>

                  {data.conversations.length >
                    0 && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/conversations"
                        )
                      }
                      className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                      View all
                    </button>
                  )}

                </div>
              </div>

              {data.conversations.length ===
              0 ? (
                <div className="px-6 py-12 text-center">

                  <MessageSquare className="mx-auto h-10 w-10 text-slate-400" />

                  <p
                    className={
                      darkMode
                        ? "mt-4 text-sm font-medium text-white"
                        : "mt-4 text-sm font-medium text-slate-900"
                    }
                  >
                    No conversations yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Customer conversations
                    will appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/conversations"
                      )
                    }
                    className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
                  >
                    Go to Conversations
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

                  {data.conversations
                    .slice(0, 10)
                    .map(
                      (
                        conversation
                      ) => (
                        <button
                          type="button"
                          key={
                            conversation.id
                          }
                          onClick={() =>
                            router.push(
                              `/conversations/${conversation.id}`
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        >

                          <div className="min-w-0">

                            <p
                              className={
                                darkMode
                                  ? "font-medium text-white"
                                  : "font-medium text-slate-900"
                              }
                            >
                              {
                                conversation.customer_name
                              }
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                              {conversation.last_message ||
                                "No message available"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                conversation.updated_at
                              )}
                            </p>

                          </div>

                          <StatusBadge
                            status={
                              conversation.status
                            }
                          />

                        </button>
                      )
                    )}

                </div>
              )}

            </section>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/* ----------------------------- */
/* AI Metric                     */
/* ----------------------------- */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "HOT" | "WARM" | "NEW";
}) {
  const styles = {
    HOT: "bg-red-500/10 text-red-400 border-red-500/20",
    WARM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    NEW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}