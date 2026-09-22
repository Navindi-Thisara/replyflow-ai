"use client";

import {
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase/client";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CONVERTED";

type Lead = {
  id: string;
  conversation_id: string | null;
  status: string;
  created_at: string;
};

type Conversation = {
  id: string;
  customer_name: string;
  last_message: string | null;
  status: "HOT" | "WARM" | "NEW";
  updated_at: string;
};

type LeadWithConversation = Lead & {
  conversation: Conversation | null;
};

const leadStatuses = [
  "ALL",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
] as const;

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeStatus(status: string | null | undefined) {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

function getStatusClasses(
  status: string,
  isDark: boolean
) {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case "CONVERTED":
      return isDark
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "QUALIFIED":
      return isDark
        ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
        : "bg-blue-50 text-blue-700 border-blue-200";

    case "CONTACTED":
      return isDark
        ? "bg-violet-500/15 text-violet-300 border-violet-500/20"
        : "bg-violet-50 text-violet-700 border-violet-200";

    default:
      return isDark
        ? "bg-slate-500/15 text-slate-300 border-slate-500/20"
        : "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function LeadsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  // =========================================================
  // HYDRATION FIX
  // =========================================================

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    mounted && resolvedTheme === "dark";

  const [leads, setLeads] = useState<
    LeadWithConversation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<(typeof leadStatuses)[number]>("ALL");

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadLeads = async (
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

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const {
        data: leadData,
        error: leadError,
      } = await supabase
        .from("leads")
        .select(
          "id, conversation_id, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (leadError) {
        throw leadError;
      }

      const conversationIds = (leadData || [])
        .map(
          (lead) => lead.conversation_id
        )
        .filter(
          (id): id is string =>
            Boolean(id)
        );

      let conversationMap = new Map<
        string,
        Conversation
      >();

      if (conversationIds.length > 0) {
        const {
          data: conversations,
          error: conversationError,
        } = await supabase
          .from("conversations")
          .select(
            "id, customer_name, last_message, status, updated_at"
          )
          .eq("user_id", user.id)
          .in("id", conversationIds);

        if (conversationError) {
          throw conversationError;
        }

        conversationMap = new Map(
          (conversations || []).map(
            (conversation) => [
              conversation.id,
              conversation as Conversation,
            ]
          )
        );
      }

      const combined: LeadWithConversation[] =
        (leadData || []).map((lead) => ({
          ...lead,

          status: normalizeStatus(
            lead.status
          ),

          conversation: lead.conversation_id
            ? conversationMap.get(
                lead.conversation_id
              ) || null
            : null,
        }));

      setLeads(combined);
    } catch (error) {
      console.error(
        "Load leads error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load leads."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const normalizedLeadStatus =
        normalizeStatus(lead.status);

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizedLeadStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const customerName =
        lead.conversation?.customer_name?.toLowerCase() ||
        "";

      const lastMessage =
        lead.conversation?.last_message?.toLowerCase() ||
        "";

      return (
        customerName.includes(search) ||
        lastMessage.includes(search) ||
        normalizedLeadStatus
          .toLowerCase()
          .includes(search)
      );
    });
  }, [
    leads,
    searchTerm,
    statusFilter,
  ]);

  const updateLeadStatus = async (
    leadId: string,
    status: string
  ) => {
    const normalizedStatus =
      normalizeStatus(status);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("leads")
        .update({
          status: normalizedStatus,
        })
        .eq("id", leadId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: normalizedStatus,
              }
            : lead
        )
      );

      setErrorMessage("");
    } catch (error) {
      console.error(
        "Update lead status error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update lead status."
      );
    }
  };

  const openConversation = (
    conversationId: string | null
  ) => {
    if (!conversationId) {
      return;
    }

    router.push(
      `/conversations/${conversationId}`
    );
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isDark
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <Users size={20} />
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Leads
                </h1>
              </div>

              <p
                className={
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }
              >
                Track and manage potential
                customers from your
                conversations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadLeads(true)
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

          {/* =================================================
              ERROR
          ================================================= */}

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

          {/* =================================================
              FILTERS
          ================================================= */}

          <div
            className={`mb-6 rounded-2xl border p-4 ${
              isDark
                ? "border-white/10 bg-[#141827]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Search */}
              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search leads..."
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition ${
                    isDark
                      ? "border-white/10 bg-[#0d0d1a] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400"
                  }`}
                />
              </div>

              {/* Status filters */}
              <div className="flex flex-wrap gap-2">
                {leadStatuses.map(
                  (status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() =>
                        setStatusFilter(
                          status
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        statusFilter ===
                        status
                          ? "bg-indigo-600 text-white"
                          : isDark
                            ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status ===
                      "ALL"
                        ? "All"
                        : status.charAt(
                              0
                            ) +
                            status
                              .slice(
                                1
                              )
                              .toLowerCase()}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              RESULTS COUNT
          ================================================= */}

          {!loading && (
            <div
              className={`mb-4 text-sm ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Showing{" "}
              <span className="font-semibold">
                {
                  filteredLeads.length
                }
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {leads.length}
              </span>{" "}
              leads
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div
              className={`flex min-h-[350px] items-center justify-center rounded-2xl border ${
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
                <Loader2
                  className="animate-spin"
                  size={20}
                />

                Loading leads...
              </div>
            </div>
          ) : filteredLeads.length ===
            0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div
              className={`flex min-h-[350px] flex-col items-center justify-center rounded-2xl border px-6 text-center ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                  isDark
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <Users size={25} />
              </div>

              <h2 className="mb-2 text-lg font-semibold">
                {leads.length === 0
                  ? "No leads yet"
                  : "No matching leads"}
              </h2>

              <p
                className={`max-w-md text-sm ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {leads.length === 0
                  ? "Leads created from your customer conversations will appear here."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            /* =================================================
               LEADS TABLE
            ================================================= */

            <div
              className={`overflow-hidden rounded-2xl border ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >

              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead
                    className={
                      isDark
                        ? "border-b border-white/10 bg-white/[0.02]"
                        : "border-b border-slate-200 bg-slate-50"
                    }
                  >
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Conversation
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Created
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map(
                      (lead) => (
                        <tr
                          key={lead.id}
                          className={`border-b last:border-0 ${
                            isDark
                              ? "border-white/5 hover:bg-white/[0.025]"
                              : "border-slate-100 hover:bg-slate-50"
                          }`}
                        >

                          {/* Customer */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold text-white">
                                {(
                                  lead
                                    .conversation
                                    ?.customer_name ||
                                  "?"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {lead
                                    .conversation
                                    ?.customer_name ||
                                    "Unknown customer"}
                                </p>

                                <p className="text-xs text-slate-500">
                                  Lead #
                                  {lead.id.slice(
                                    0,
                                    8
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Conversation */}
                          <td className="max-w-sm px-6 py-5">
                            <p
                              className={`truncate text-sm ${
                                isDark
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {lead
                                .conversation
                                ?.last_message ||
                                "No message available"}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <select
                              value={normalizeStatus(
                                lead.status
                              )}
                              onChange={(
                                event
                              ) =>
                                updateLeadStatus(
                                  lead.id,
                                  event
                                    .target
                                    .value
                                )
                              }
                              className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none ${
                                isDark
                                  ? "border-white/10 bg-[#0d0d1a] text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {leadStatuses
                                .filter(
                                  (
                                    status
                                  ) =>
                                    status !==
                                    "ALL"
                                )
                                .map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {
                                        status
                                      }
                                    </option>
                                  )
                                )}
                            </select>
                          </td>

                          {/* Created */}
                          <td
                            className={`px-6 py-5 text-sm ${
                              isDark
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {formatDate(
                              lead.created_at
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openConversation(
                                  lead.conversation_id
                                )
                              }
                              disabled={
                                !lead.conversation_id
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              View
                              <ArrowRight
                                size={14}
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredLeads.map(
                  (lead) => (
                    <div
                      key={lead.id}
                      className={`rounded-xl border p-4 ${
                        isDark
                          ? "border-white/10 bg-[#0d0d1a]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold text-white">
                            {(
                              lead
                                .conversation
                                ?.customer_name ||
                              "?"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {lead
                                .conversation
                                ?.customer_name ||
                                "Unknown customer"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {formatDate(
                                lead.created_at
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                            lead.status,
                            isDark
                          )}`}
                        >
                          {normalizeStatus(
                            lead.status
                          )}
                        </span>
                      </div>

                      <p
                        className={`mb-4 text-sm ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {lead
                          .conversation
                          ?.last_message ||
                          "No message available"}
                      </p>

                      <div className="mb-3">
                        <label
                          className={`mb-1.5 block text-xs font-medium ${
                            isDark
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          Lead Status
                        </label>

                        <select
                          value={normalizeStatus(
                            lead.status
                          )}
                          onChange={(
                            event
                          ) =>
                            updateLeadStatus(
                              lead.id,
                              event.target.value
                            )
                          }
                          className={`w-full rounded-lg border px-3 py-2.5 text-xs font-semibold outline-none ${
                            isDark
                              ? "border-white/10 bg-[#141827] text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {leadStatuses
                            .filter(
                              (status) =>
                                status !==
                                "ALL"
                            )
                            .map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openConversation(
                            lead.conversation_id
                          )
                        }
                        disabled={
                          !lead.conversation_id
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Open Conversation
                        <ArrowRight
                          size={15}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}