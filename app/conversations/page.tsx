"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Plus,
  RefreshCw,
  LogOut,
  Loader2,
  X,
  Flame,
  Clock3,
  Sparkles,
  Menu,
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

type FilterStatus = "ALL" | ConversationStatus;

export default function ConversationsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const darkMode = resolvedTheme !== "light";

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [userName, setUserName] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>("ALL");

  const [error, setError] = useState("");

  /*
   * Mobile sidebar
   */
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /*
   * Load conversations belonging ONLY
   * to the currently authenticated user.
   */
  async function loadConversations() {
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
        router.replace("/login");
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "there";

      setUserName(fullName);

      /*
       * Load conversations for the
       * authenticated user only.
       */
      const {
        data,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, customer_name, last_message, status, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        });

      if (conversationError) {
        throw new Error(
          `Conversations: ${conversationError.message}`
        );
      }

      setConversations(data ?? []);
    } catch (err) {
      console.error(
        "CONVERSATIONS ERROR:",
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

  /*
   * Initial load.
   */
  useEffect(() => {
    loadConversations();
  }, []);

  /*
   * Refresh.
   */
  async function handleRefresh() {
    setRefreshing(true);
    await loadConversations();
  }

  /*
   * Logout.
   */
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

  /*
   * Search + status filtering.
   */
  const filteredConversations = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return conversations.filter(
      (conversation) => {
        const matchesSearch =
          normalizedSearch === "" ||
          conversation.customer_name
            .toLowerCase()
            .includes(normalizedSearch) ||
          (
            conversation.last_message || ""
          )
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          activeFilter === "ALL" ||
          conversation.status ===
            activeFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    conversations,
    searchQuery,
    activeFilter,
  ]);

  /*
   * Counts for filter buttons.
   */
  const statusCounts = useMemo(() => {
    return {
      ALL: conversations.length,

      HOT: conversations.filter(
        (conversation) =>
          conversation.status ===
          "HOT"
      ).length,

      WARM: conversations.filter(
        (conversation) =>
          conversation.status ===
          "WARM"
      ).length,

      NEW: conversations.filter(
        (conversation) =>
          conversation.status ===
          "NEW"
      ).length,
    };
  }, [conversations]);

  /*
   * Open conversation.
   */
  function openConversation(
    conversationId: string
  ) {
    router.push(
      `/conversations/${conversationId}`
    );
  }

  /*
   * Create new conversation.
   */
  function handleNewConversation() {
    router.push(
      "/conversations/new"
    );
  }

  /*
   * Loading state.
   */
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
              Loading conversations...
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
      {/* Main Navbar */}
      <Navbar />

      {/* Dashboard Sidebar */}
      <DashboardSidebar
        mobileOpen={
          mobileSidebarOpen
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Main Content */}
      <div className="pt-[76px] lg:pl-[260px]">
        <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

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
                    <div className="flex items-center gap-3">

                      <div
                        className={
                          darkMode
                            ? "rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400"
                            : "rounded-xl bg-indigo-50 p-2.5 text-indigo-600"
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
                          Conversations
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                          Manage and respond to
                          your customer
                          conversations.
                        </p>
                      </div>

                    </div>
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
                        ? "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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

                  {/* New Conversation */}
                  <button
                    type="button"
                    onClick={
                      handleNewConversation
                    }
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4" />
                    New Conversation
                  </button>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>

                </div>
              </div>
            </header>

            {/* Error */}
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
                  onClick={() =>
                    setError("")
                  }
                  className={
                    darkMode
                      ? "shrink-0 rounded-md p-1 transition hover:bg-red-500/10"
                      : "shrink-0 rounded-md p-1 transition hover:bg-red-100"
                  }
                  aria-label="Close error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Search + Filters */}
            <section
              className={
                darkMode
                  ? "rounded-2xl border border-white/10 bg-[#141827] p-4 sm:p-5"
                  : "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
              }
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* Search */}
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={
                      searchQuery
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchQuery(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search conversations..."
                    className={
                      darkMode
                        ? "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
                        : "w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white"
                    }
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery(
                          ""
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">

                  <FilterButton
                    label="All"
                    count={
                      statusCounts.ALL
                    }
                    active={
                      activeFilter ===
                      "ALL"
                    }
                    onClick={() =>
                      setActiveFilter(
                        "ALL"
                      )
                    }
                    darkMode={
                      darkMode
                    }
                  />

                  <FilterButton
                    label="Hot"
                    count={
                      statusCounts.HOT
                    }
                    active={
                      activeFilter ===
                      "HOT"
                    }
                    onClick={() =>
                      setActiveFilter(
                        "HOT"
                      )
                    }
                    darkMode={
                      darkMode
                    }
                    icon={
                      <Flame className="h-3.5 w-3.5" />
                    }
                  />

                  <FilterButton
                    label="Warm"
                    count={
                      statusCounts.WARM
                    }
                    active={
                      activeFilter ===
                      "WARM"
                    }
                    onClick={() =>
                      setActiveFilter(
                        "WARM"
                      )
                    }
                    darkMode={
                      darkMode
                    }
                    icon={
                      <Clock3 className="h-3.5 w-3.5" />
                    }
                  />

                  <FilterButton
                    label="New"
                    count={
                      statusCounts.NEW
                    }
                    active={
                      activeFilter ===
                      "NEW"
                    }
                    onClick={() =>
                      setActiveFilter(
                        "NEW"
                      )
                    }
                    darkMode={
                      darkMode
                    }
                    icon={
                      <Sparkles className="h-3.5 w-3.5" />
                    }
                  />

                </div>
              </div>
            </section>

            {/* Conversation List */}
            <section
              className={
                darkMode
                  ? "mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#141827]"
                  : "mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"
              }
            >

              {/* List Header */}
              <div
                className={
                  darkMode
                    ? "flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6"
                    : "flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6"
                }
              >
                <div>
                  <h2
                    className={
                      darkMode
                        ? "font-semibold text-white"
                        : "font-semibold text-slate-900"
                    }
                  >
                    All Conversations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      filteredConversations.length
                    }{" "}
                    conversation
                    {filteredConversations.length !==
                    1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live data
                </div>
              </div>

              {/* No conversations */}
              {conversations.length ===
              0 ? (
                <EmptyState
                  title="No conversations yet"
                  description="Start your first customer conversation to begin managing interactions with ReplyFlow AI."
                  buttonText="Create Conversation"
                  onClick={
                    handleNewConversation
                  }
                  darkMode={
                    darkMode
                  }
                />
              ) : filteredConversations.length ===
                0 ? (
                <EmptyState
                  title="No matching conversations"
                  description="Try changing your search or selecting a different conversation status."
                  buttonText="Clear Filters"
                  onClick={() => {
                    setSearchQuery(
                      ""
                    );
                    setActiveFilter(
                      "ALL"
                    );
                  }}
                  darkMode={
                    darkMode
                  }
                  secondary
                />
              ) : (
                <div
                  className={
                    darkMode
                      ? "divide-y divide-white/10"
                      : "divide-y divide-slate-100"
                  }
                >
                  {filteredConversations.map(
                    (
                      conversation
                    ) => (
                      <ConversationRow
                        key={
                          conversation.id
                        }
                        conversation={
                          conversation
                        }
                        darkMode={
                          darkMode
                        }
                        onClick={() =>
                          openConversation(
                            conversation.id
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

            </section>

            {/* Footer note */}
            <div className="mt-5 flex items-center justify-between px-1">
              <p className="text-xs text-slate-500">
                Signed in as{" "}
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                {
                  conversations.length
                }{" "}
                total
              </p>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/* -------------------------------- */
/* Filter Button                    */
/* -------------------------------- */

function FilterButton({
  label,
  count,
  active,
  onClick,
  darkMode,
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  darkMode: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
          : darkMode
          ? "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
          : "flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      }
    >
      {icon}

      {label}

      <span
        className={
          active
            ? "rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]"
            : darkMode
            ? "rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]"
            : "rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]"
        }
      >
        {count}
      </span>
    </button>
  );
}

/* -------------------------------- */
/* Conversation Row                 */
/* -------------------------------- */

function ConversationRow({
  conversation,
  darkMode,
  onClick,
}: {
  conversation: Conversation;
  darkMode: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        darkMode
          ? "group flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-white/[0.03] sm:px-6"
          : "group flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
      }
    >
      {/* Avatar */}
      <div
        className={
          darkMode
            ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-400"
            : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600"
        }
      >
        {getInitials(
          conversation.customer_name
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p
            className={
              darkMode
                ? "truncate font-medium text-white"
                : "truncate font-medium text-slate-900"
            }
          >
            {
              conversation.customer_name
            }
          </p>

          <StatusBadge
            status={
              conversation.status
            }
          />
        </div>

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

      {/* Arrow */}
      <div
        className={
          darkMode
            ? "hidden text-slate-500 transition group-hover:translate-x-1 group-hover:text-indigo-400 sm:block"
            : "hidden text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600 sm:block"
        }
      >
        →
      </div>
    </button>
  );
}

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


function EmptyState({
  title,
  description,
  buttonText,
  onClick,
  darkMode,
  secondary = false,
}: {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  darkMode: boolean;
  secondary?: boolean;
}) {
  return (
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

      <h3
        className={
          darkMode
            ? "mt-5 text-sm font-semibold text-white"
            : "mt-5 text-sm font-semibold text-slate-900"
        }
      >
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={
          secondary
            ? darkMode
              ? "mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              : "mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            : "mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        }
      >
        {!secondary && (
          <Plus className="h-4 w-4" />
        )}

        {buttonText}
      </button>
    </div>
  );
}

function getInitials(name: string) {
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Just now";
  }

  if (difference < hour) {
    const minutes = Math.floor(
      difference / minute
    );

    return `${minutes}m ago`;
  }

  if (difference < day) {
    const hours = Math.floor(
      difference / hour
    );

    return `${hours}h ago`;
  }

  if (difference < 7 * day) {
    const days = Math.floor(
      difference / day
    );

    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
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
