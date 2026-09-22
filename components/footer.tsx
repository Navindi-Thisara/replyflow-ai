"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { Bot } from "lucide-react";

function FooterLink({
  href,
  children,
  darkMode,
}: {
  href: string;
  children: ReactNode;
  darkMode: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        darkMode
          ? "block text-xs text-slate-500 transition hover:text-white"
          : "block text-xs text-slate-500 transition hover:text-slate-950"
      }
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme !== "light";

  return (
    <footer
      className={
        darkMode
          ? "border-t border-white/10 px-6 py-12"
          : "border-t border-slate-200 bg-white px-6 py-12"
      }
    >
      <div className="mx-auto max-w-7xl">

        {/* Main Footer */}

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}

          <div className="md:col-span-2">
            <Link
              href="/"
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

                <div className="text-[10px] text-slate-500">
                  AI Customer Assistant
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-xs leading-6 text-slate-500">
              AI-powered customer conversation management for
              modern small businesses.
            </p>

            <div className="mt-5 text-xs text-slate-500">
              Built with AI. Designed for humans.
            </div>
          </div>

          {/* Product */}

          <div>
            <div
              className={
                darkMode
                  ? "mb-4 text-xs font-semibold text-white"
                  : "mb-4 text-xs font-semibold text-slate-900"
              }
            >
              Product
            </div>

            <div className="space-y-3">
              <FooterLink
                href="/#services"
                darkMode={darkMode}
              >
                Features
              </FooterLink>

              <FooterLink
                href="/#pricing"
                darkMode={darkMode}
              >
                Pricing
              </FooterLink>

              <FooterLink
                href="/#how-it-works"
                darkMode={darkMode}
              >
                How It Works
              </FooterLink>

              <FooterLink
                href="/dashboard"
                darkMode={darkMode}
              >
                Dashboard
              </FooterLink>
            </div>
          </div>

          {/* Company */}

          <div>
            <div
              className={
                darkMode
                  ? "mb-4 text-xs font-semibold text-white"
                  : "mb-4 text-xs font-semibold text-slate-900"
              }
            >
              Company
            </div>

            <div className="space-y-3">
              <FooterLink
                href="/#about"
                darkMode={darkMode}
              >
                About
              </FooterLink>

              <FooterLink
                href="/#contact"
                darkMode={darkMode}
              >
                Contact
              </FooterLink>

              <FooterLink
                href="/login"
                darkMode={darkMode}
              >
                Login
              </FooterLink>

              <FooterLink
                href="/register"
                darkMode={darkMode}
              >
                Register
              </FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}

        <div
          className={
            darkMode
              ? "mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-[10px] text-slate-600 sm:flex-row"
              : "mt-12 flex flex-col justify-between gap-4 border-t border-slate-200 pt-7 text-[10px] text-slate-500 sm:flex-row"
          }
        >
          <span>
            © {new Date().getFullYear()} ReplyFlow. All rights reserved.
          </span>

          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}