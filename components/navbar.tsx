"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/20">
          <div className="flex h-12 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                <Bot className="h-5 w-5" />
              </div>

              <div className="leading-tight">
                <div className="font-bold tracking-tight text-slate-950 dark:text-white">
                  ReplyFlow
                </div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-indigo-500">
                  AI
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#about"
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
              >
                About
              </a>

              <a
                href="#services"
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
              >
                Services
              </a>

              <a
                href="#pricing"
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
              >
                Pricing
              </a>

              <a
                href="#contact"
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
              >
                Contact
              </a>
            </div>

            {/* Actions */}
            <div className="hidden items-center gap-2 md:flex">
              <ThemeToggle />

              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-400"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />

              <button
                onClick={() => setOpen(!open)}
                className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Toggle navigation"
              >
                {open ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="border-t border-slate-200 py-4 dark:border-white/10 md:hidden">
              <div className="flex flex-col gap-2">
                <a href="#about" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10">
                  About
                </a>

                <a href="#services" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10">
                  Services
                </a>

                <a href="#pricing" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10">
                  Pricing
                </a>

                <a href="#contact" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10">
                  Contact
                </a>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl border px-4 py-3 text-center text-sm font-semibold"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}