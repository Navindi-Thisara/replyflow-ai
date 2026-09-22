"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Target,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";

import { supabase } from "@/lib/supabase/client";

type DashboardSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Target,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar({
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const fullName = user.user_metadata?.full_name;

      setUserName(
        fullName ||
          user.email?.split("@")[0] ||
          "User"
      );

      setUserEmail(user.email || "");
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  const sidebarWidth = collapsed ? "w-[76px]" : "w-[260px]";

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r
          border-slate-200/80 bg-white
          dark:border-white/10 dark:bg-[#0d0d1a]
          ${sidebarWidth}
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div
          className={`
            flex h-[76px] shrink-0 items-center border-b
            border-slate-200/80 dark:border-white/10
            ${collapsed ? "justify-center px-3" : "justify-between px-5"}
          `}
        >
          <Link
            href="/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-slate-900 dark:text-white">
                  ReplyFlow
                </p>
                <p className="text-[10px] font-medium tracking-[0.16em] text-indigo-600 dark:text-cyan-400">
                  AI
                </p>
              </div>
            )}
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Workspace
            </p>
          )}

          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group relative flex items-center rounded-xl
                    px-3 py-3 text-sm font-medium
                    transition-all duration-200
                    ${
                      collapsed
                        ? "justify-center"
                        : "gap-3"
                    }
                    ${
                      active
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-cyan-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-600 to-cyan-500" />
                  )}

                  <Icon
                    className={`
                      h-[19px] w-[19px] shrink-0
                      transition-colors
                      ${
                        active
                          ? "text-indigo-600 dark:text-cyan-400"
                          : "text-slate-500 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white"
                      }
                    `}
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* AI Status */}
          {!collapsed && (
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-cyan-500/5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-500/20">
                  <Bot className="h-4 w-4 text-white" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    AI Assistant
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                Your AI assistant is ready to help manage customer
                conversations.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="shrink-0 border-t border-slate-200/80 p-3 dark:border-white/10">
          {/* User Profile */}
          <div
            className={`
              mb-2 flex items-center rounded-xl
              bg-slate-50 dark:bg-white/5
              ${collapsed ? "justify-center p-2" : "gap-3 p-3"}
            `}
            title={collapsed ? userName : undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 text-xs font-bold text-white">
              {initials || "U"}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {userName}
                </p>

                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {userEmail || "Signed in"}
                </p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Logout" : undefined}
            className={`
              flex w-full items-center rounded-xl
              px-3 py-2.5 text-sm font-medium
              text-slate-600 transition
              hover:bg-red-50 hover:text-red-600
              disabled:cursor-not-allowed disabled:opacity-60
              dark:text-slate-400
              dark:hover:bg-red-500/10 dark:hover:text-red-400
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            {loggingOut ? (
              <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-[18px] w-[18px] shrink-0" />
            )}

            {!collapsed && (
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            )}
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[88px] hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-[#141827] dark:text-slate-400 dark:hover:border-indigo-500/50 dark:hover:text-cyan-400 lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}
