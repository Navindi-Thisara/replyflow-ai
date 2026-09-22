"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bot,
  Menu,
  Moon,
  Sun,
  X,
  LogOut,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

function NavLink({
  href,
  children,
  darkMode,
}: {
  href: string;
  children: ReactNode;
  darkMode: boolean;
}) {
  return (
    <a
      href={href}
      className={
        darkMode
          ? "text-sm text-slate-400 transition hover:text-white"
          : "text-sm text-slate-600 transition hover:text-slate-950"
      }
    >
      {children}
    </a>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const darkMode = resolvedTheme !== "light";

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const isAuthPage = isLoginPage || isRegisterPage;

  const navigationItems = [
    ["About", "#about"],
    ["Services", "#services"],
    ["How It Works", "#how-it-works"],
    ["Pricing", "#pricing"],
    ["Contact", "#contact"],
  ];

  function closeMobileMenu() {
    setMobileMenu(false);
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        setLoggingOut(false);
        return;
      }

      closeMobileMenu();

      // Redirect to login after successful logout
      router.replace("/login");

      // Refresh the route so protected pages cannot
      // continue showing stale authenticated state.
      router.refresh();
    } catch (error) {
      console.error("Unexpected logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={
          darkMode
            ? "mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#090d1a]/85 shadow-2xl backdrop-blur-xl"
            : "mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur-xl"
        }
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">

          {/* Logo */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>

            <div>
              <div
                className={
                  darkMode
                    ? "text-sm font-bold tracking-tight text-white"
                    : "text-sm font-bold tracking-tight text-slate-950"
                }
              >
                ReplyFlow
              </div>

              <div className="hidden text-[10px] text-slate-500 sm:block">
                AI Customer Assistant
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-7 lg:flex">
            {isHomePage ? (
              <>
                <NavLink href="#about" darkMode={darkMode}>
                  About
                </NavLink>

                <NavLink href="#services" darkMode={darkMode}>
                  Services
                </NavLink>

                <NavLink href="#how-it-works" darkMode={darkMode}>
                  How It Works
                </NavLink>

                <NavLink href="#pricing" darkMode={darkMode}>
                  Pricing
                </NavLink>

                <NavLink href="#contact" darkMode={darkMode}>
                  Contact
                </NavLink>
              </>
            ) : (
              <Link
                href="/"
                className={
                  darkMode
                    ? "text-sm text-slate-400 transition hover:text-white"
                    : "text-sm text-slate-600 transition hover:text-slate-950"
                }
              >
                Home
              </Link>
            )}
          </div>

          {/* Desktop Actions */}

          <div className="hidden items-center gap-2 sm:flex">

            {/* Theme Toggle */}

            <button
              type="button"
              onClick={() =>
                setTheme(darkMode ? "light" : "dark")
              }
              className={
                darkMode
                  ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  : "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-950"
              }
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Home Page Actions */}

            {isHomePage && (
              <>
                <Link
                  href="/login"
                  className={
                    darkMode
                      ? "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
                      : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                  }
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Login Page Actions */}

            {isLoginPage && (
              <>
                <Link
                  href="/register"
                  className={
                    darkMode
                      ? "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
                      : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                  }
                >
                  Register
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Register Page Actions */}

            {isRegisterPage && (
              <>
                <Link
                  href="/login"
                  className={
                    darkMode
                      ? "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
                      : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                  }
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Other Pages */}

            {!isHomePage && !isAuthPage && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={
                  darkMode
                    ? "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                }
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}

                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            )}
          </div>

          {/* Mobile Button */}

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className={
              darkMode
                ? "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:hidden"
                : "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 sm:hidden"
            }
            aria-label={
              mobileMenu ? "Close menu" : "Open menu"
            }
          >
            {mobileMenu ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}

        {mobileMenu && (
          <div
            className={
              darkMode
                ? "border-t border-white/10 px-4 pb-4 pt-3 sm:hidden"
                : "border-t border-slate-200 px-4 pb-4 pt-3 sm:hidden"
            }
          >
            <div className="flex flex-col gap-1">

              {/* Navigation */}

              {isHomePage ? (
                navigationItems.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={closeMobileMenu}
                    className={
                      darkMode
                        ? "rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                        : "rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }
                  >
                    {label}
                  </a>
                ))
              ) : (
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={
                    darkMode
                      ? "rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                      : "rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }
                >
                  Home
                </Link>
              )}

              {/* Mobile Actions */}

              <div
                className={
                  darkMode
                    ? "mt-2 flex gap-2 border-t border-white/10 pt-3"
                    : "mt-2 flex gap-2 border-t border-slate-200 pt-3"
                }
              >

                {/* Theme */}

                <button
                  type="button"
                  onClick={() =>
                    setTheme(darkMode ? "light" : "dark")
                  }
                  className={
                    darkMode
                      ? "flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400"
                      : "flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
                  }
                  aria-label="Toggle theme"
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>

                {/* Home */}

                {isHomePage && (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className={
                        darkMode
                          ? "flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm text-slate-300"
                          : "flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-600"
                      }
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Get Started
                    </Link>
                  </>
                )}

                {/* Login */}

                {isLoginPage && (
                  <>
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className={
                        darkMode
                          ? "flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm text-slate-300"
                          : "flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-600"
                      }
                    >
                      Register
                    </Link>

                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Get Started
                    </Link>
                  </>
                )}

                {/* Register */}

                {isRegisterPage && (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className={
                        darkMode
                          ? "flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm text-slate-300"
                          : "flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-600"
                      }
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Get Started
                    </Link>
                  </>
                )}

                {/* Other Pages */}

                {!isHomePage && !isAuthPage && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={
                      darkMode
                        ? "flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                        : "flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                    }
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}

                      {loggingOut
                        ? "Logging out..."
                        : "Logout"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}