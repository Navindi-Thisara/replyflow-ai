"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [contactSent, setContactSent] = useState(false);

  /* ------------------------------------------------------------ */
  /* THEME */
  /* ------------------------------------------------------------ */

  useEffect(() => {
    const savedTheme = localStorage.getItem("replyflow-theme");

    if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "replyflow-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  /* ------------------------------------------------------------ */
  /* CONVERSATIONS */
  /* ------------------------------------------------------------ */

  const conversations = [
    {
      name: "Sarah Miller",
      initials: "SM",
      message: "Can I get a quote for the premium plan?",
      time: "2m",
      score: 92,
      status: "High intent",
    },
    {
      name: "James Wilson",
      initials: "JW",
      message: "Thanks for getting back to me!",
      time: "12m",
      score: 64,
      status: "Interested",
    },
    {
      name: "Emma Davis",
      initials: "ED",
      message: "Is the product available this week?",
      time: "24m",
      score: 81,
      status: "High intent",
    },
  ];

  const currentConversation =
    conversations[selectedConversation];

  /* ------------------------------------------------------------ */
  /* CONTACT */
  /* ------------------------------------------------------------ */

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const message = String(formData.get("message") || "");

    const subject = encodeURIComponent(
      `ReplyFlow Contact - ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:navindithisara214@gmail.com?subject=${subject}&body=${body}`;
    setContactSent(true);
  }

  return (
    <main
      className={
        darkMode
          ? "min-h-screen overflow-x-hidden bg-[#070b17] text-white transition-colors duration-300"
          : "min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 transition-colors duration-300"
      }
    >
      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

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

            <Link href="/" className="flex items-center gap-3">
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

                <div
                  className={
                    darkMode
                      ? "hidden text-[10px] text-slate-500 sm:block"
                      : "hidden text-[10px] text-slate-500 sm:block"
                  }
                >
                  AI Customer Assistant
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}

            <div className="hidden items-center gap-7 lg:flex">
              <NavLink href="#about" darkMode={darkMode}>
                About
              </NavLink>

              <NavLink href="#services" darkMode={darkMode}>
                Services
              </NavLink>

              <NavLink
                href="#how-it-works"
                darkMode={darkMode}
              >
                How It Works
              </NavLink>

              <NavLink href="#pricing" darkMode={darkMode}>
                Pricing
              </NavLink>

              <NavLink href="#contact" darkMode={darkMode}>
                Contact
              </NavLink>
            </div>

            {/* Desktop Actions */}

            <div className="hidden items-center gap-2 sm:flex">
              {/* Theme Toggle */}

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
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
              aria-label="Open menu"
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
                {[
                  ["About", "#about"],
                  ["Services", "#services"],
                  ["How It Works", "#how-it-works"],
                  ["Pricing", "#pricing"],
                  ["Contact", "#contact"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileMenu(false)}
                    className={
                      darkMode
                        ? "rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                        : "rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }
                  >
                    {label}
                  </a>
                ))}

                <div
                  className={
                    darkMode
                      ? "mt-2 flex gap-2 border-t border-white/10 pt-3"
                      : "mt-2 flex gap-2 border-t border-slate-200 pt-3"
                  }
                >
                  <Link
                    href="/login"
                    className={
                      darkMode
                        ? "flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm"
                        : "flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm"
                    }
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden px-6 pb-20 pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />

          <div className="absolute right-0 top-[500px] h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px]" />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top, rgba(99,102,241,0.12), transparent 42%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
  darkMode
    ? "border border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
    : "border border-indigo-200 bg-indigo-50 text-indigo-700"
}`}
            >
              <Sparkles className="h-4 w-4" />
              AI-powered customer conversations
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={
                darkMode
                  ? "text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
                  : "text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl"
              }
            >
              Turn every conversation

              <span className="block bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                into an opportunity.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={
                darkMode
                  ? "mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg"
                  : "mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
              }
            >
              ReplyFlow helps small businesses respond faster,
              identify high-value leads, and turn customer
              conversations into measurable growth with AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Start for free

                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className={
                  darkMode
                    ? "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    : "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                }
              >
                See how it works
              </a>
            </motion.div>

            <div
              className={
                darkMode
                  ? "mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500"
                  : "mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500"
              }
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No credit card required
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                AI-powered replies
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Simple setup
              </span>
            </div>
          </div>

          {/* Hero Dashboard Preview */}

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="relative mx-auto mt-20 max-w-6xl"
          >
            <div className="absolute -inset-8 rounded-[3rem] bg-indigo-500/10 blur-3xl" />

            <div
              className={
                darkMode
                  ? "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1221] shadow-2xl shadow-black/60"
                  : "relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              }
            >
              {/* Browser Header */}

              <div
                className={
                  darkMode
                    ? "flex h-12 items-center gap-2 border-b border-white/10 px-5"
                    : "flex h-12 items-center gap-2 border-b border-slate-200 px-5"
                }
              >
                <div className="h-3 w-3 rounded-full bg-red-400/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <div className="h-3 w-3 rounded-full bg-green-400/60" />

                <div
                  className={
                    darkMode
                      ? "ml-4 rounded-md bg-white/5 px-4 py-1 text-[9px] text-slate-600"
                      : "ml-4 rounded-md bg-slate-100 px-4 py-1 text-[9px] text-slate-500"
                  }
                >
                  app.replyflow.ai
                </div>
              </div>

              <div className="grid min-h-[430px] md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr_220px]">
                {/* Sidebar */}

                <div
                  className={
                    darkMode
                      ? "hidden border-r border-white/10 p-4 md:block"
                      : "hidden border-r border-slate-200 p-4 md:block"
                  }
                >
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>

                    <span
                      className={
                        darkMode
                          ? "text-xs font-semibold"
                          : "text-xs font-semibold text-slate-900"
                      }
                    >
                      ReplyFlow
                    </span>
                  </div>

                  <div className="space-y-1">
                    <MiniNav
                      icon={<Inbox />}
                      text="Inbox"
                      active
                      darkMode={darkMode}
                    />

                    <MiniNav
                      icon={<Users />}
                      text="Customers"
                      darkMode={darkMode}
                    />

                    <MiniNav
                      icon={<BarChart3 />}
                      text="Analytics"
                      darkMode={darkMode}
                    />

                    <MiniNav
                      icon={<Settings />}
                      text="Settings"
                      darkMode={darkMode}
                    />
                  </div>

                  <div
                    className={
                      darkMode
                        ? "mt-8 border-t border-white/10 pt-5"
                        : "mt-8 border-t border-slate-200 pt-5"
                    }
                  >
                    <div
                      className={
                        darkMode
                          ? "text-[8px] font-semibold text-slate-600"
                          : "text-[8px] font-semibold text-slate-400"
                      }
                    >
                      AI ASSISTANT
                    </div>

                    <div className="mt-3 rounded-lg bg-indigo-500/10 p-3">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />

                      <div
                        className={
                          darkMode
                            ? "mt-2 text-[9px] text-slate-400"
                            : "mt-2 text-[9px] text-slate-500"
                        }
                      >
                        AI suggestions are ready.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inbox */}

                <div className="min-w-0">
                  <div
                    className={
                      darkMode
                        ? "flex items-center justify-between border-b border-white/10 px-5 py-4"
                        : "flex items-center justify-between border-b border-slate-200 px-5 py-4"
                    }
                  >
                    <div>
                      <div
                        className={
                          darkMode
                            ? "text-sm font-semibold"
                            : "text-sm font-semibold text-slate-900"
                        }
                      >
                        Inbox
                      </div>

                      <div
                        className={
                          darkMode
                            ? "mt-0.5 text-[9px] text-slate-600"
                            : "mt-0.5 text-[9px] text-slate-400"
                        }
                      >
                        24 active conversations
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Search
                        className={
                          darkMode
                            ? "h-4 w-4 text-slate-600"
                            : "h-4 w-4 text-slate-400"
                        }
                      />

                      <Bell
                        className={
                          darkMode
                            ? "h-4 w-4 text-slate-600"
                            : "h-4 w-4 text-slate-400"
                        }
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    {conversations.map((item, index) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() =>
                          setSelectedConversation(index)
                        }
                        className={`mb-2 w-full rounded-xl p-3 text-left transition ${
                          selectedConversation === index
                            ? "bg-indigo-500/10 ring-1 ring-indigo-500/20"
                            : darkMode
                              ? "hover:bg-white/[0.03]"
                              : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={
                              darkMode
                                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold"
                                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-700"
                            }
                          >
                            {item.initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between">
                              <span
                                className={
                                  darkMode
                                    ? "text-[10px] font-semibold"
                                    : "text-[10px] font-semibold text-slate-900"
                                }
                              >
                                {item.name}
                              </span>

                              <span
                                className={
                                  darkMode
                                    ? "text-[8px] text-slate-600"
                                    : "text-[8px] text-slate-400"
                                }
                              >
                                {item.time}
                              </span>
                            </div>

                            <div
                              className={
                                darkMode
                                  ? "mt-1 truncate text-[9px] text-slate-500"
                                  : "mt-1 truncate text-[9px] text-slate-500"
                              }
                            >
                              {item.message}
                            </div>
                          </div>

                          {index === 0 && (
                            <span className="h-2 w-2 rounded-full bg-indigo-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation */}

                <div
                  className={
                    darkMode
                      ? "hidden border-l border-white/10 lg:block"
                      : "hidden border-l border-slate-200 lg:block"
                  }
                >
                  <div
                    className={
                      darkMode
                        ? "flex items-center justify-between border-b border-white/10 px-4 py-4"
                        : "flex items-center justify-between border-b border-slate-200 px-4 py-4"
                    }
                  >
                    <div>
                      <div
                        className={
                          darkMode
                            ? "text-xs font-semibold"
                            : "text-xs font-semibold text-slate-900"
                        }
                      >
                        {currentConversation.name}
                      </div>

                      <div className="mt-1 text-[9px] text-emerald-500">
                        ● Online
                      </div>
                    </div>

                    <MoreHorizontal
                      className={
                        darkMode
                          ? "h-4 w-4 text-slate-600"
                          : "h-4 w-4 text-slate-400"
                      }
                    />
                  </div>

                  <div className="space-y-4 p-4">
                    <div
                      className={
                        darkMode
                          ? "text-center text-[8px] text-slate-700"
                          : "text-center text-[8px] text-slate-400"
                      }
                    >
                      Today, 10:24 AM
                    </div>

                    <div
                      className={
                        darkMode
                          ? "rounded-xl rounded-tl-sm bg-white/5 p-3"
                          : "rounded-xl rounded-tl-sm bg-slate-100 p-3"
                      }
                    >
                      <p
                        className={
                          darkMode
                            ? "text-[9px] leading-4 text-slate-400"
                            : "text-[9px] leading-4 text-slate-600"
                        }
                      >
                        Hi! I&apos;m interested in your premium
                        package. Could you send me a quote?
                      </p>
                    </div>

                    <div className="ml-5 rounded-xl rounded-tr-sm bg-indigo-600 p-3">
                      <p className="text-[9px] leading-4 text-white">
                        Absolutely! I&apos;d be happy to help. I
                        can prepare a personalized quote.
                      </p>
                    </div>

                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-indigo-400" />

                        <span className="text-[9px] font-semibold text-indigo-300">
                          AI suggestion
                        </span>
                      </div>

                      <p
                        className={
                          darkMode
                            ? "mt-2 text-[8px] leading-4 text-slate-500"
                            : "mt-2 text-[8px] leading-4 text-slate-500"
                        }
                      >
                        Customer shows strong purchase intent.
                      </p>
                    </div>

                    <div
                      className={
                        darkMode
                          ? "flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2"
                          : "flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
                      }
                    >
                      <input
                        disabled
                        placeholder="Write a reply..."
                        className={
                          darkMode
                            ? "min-w-0 flex-1 bg-transparent text-[9px] outline-none placeholder:text-slate-700"
                            : "min-w-0 flex-1 bg-transparent text-[9px] outline-none placeholder:text-slate-400"
                        }
                      />

                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                        <Send className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATS */}
      {/* ========================================================= */}

      <section
        className={
          darkMode
            ? "border-y border-white/10 bg-white/[0.02] px-6 py-16"
            : "border-y border-slate-200 bg-white px-6 py-16"
        }
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
          <Stat
            icon={<Clock3 />}
            value="10x"
            label="Faster replies"
            darkMode={darkMode}
          />

          <Stat
            icon={<Sparkles />}
            value="24/7"
            label="AI assistance"
            darkMode={darkMode}
          />

          <Stat
            icon={<TrendingUp />}
            value="85%"
            label="Less manual work"
            darkMode={darkMode}
          />

          <Stat
            icon={<MessageSquare />}
            value="1"
            label="Unified inbox"
            darkMode={darkMode}
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* ABOUT */}
      {/* ========================================================= */}

      <section id="about" className="relative px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 text-xs font-semibold tracking-widest text-indigo-500">
              ABOUT REPLYFLOW
            </div>

            <h2
              className={
                darkMode
                  ? "text-3xl font-bold tracking-tight sm:text-4xl"
                  : "text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
              }
            >
              Customer communication

              <span
                className={
                  darkMode
                    ? "block text-slate-500"
                    : "block text-slate-400"
                }
              >
                shouldn&apos;t slow you down.
              </span>
            </h2>

            <p
              className={
                darkMode
                  ? "mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base"
                  : "mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base"
              }
            >
              ReplyFlow brings customer conversations and
              AI-powered insights together in one workspace.
              Instead of switching between tools, teams can
              understand, prioritize, and respond to customers
              from one place.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Generate context-aware customer replies",
                "Automatically identify high-value conversations",
                "Understand customer intent and sentiment",
                "Keep your team focused on conversations that matter",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-500" />

                  <span
                    className={
                      darkMode
                        ? "text-sm text-slate-300"
                        : "text-sm text-slate-700"
                    }
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-10 rounded-full bg-indigo-600/10 blur-3xl" />

            <div className="relative grid gap-4 sm:grid-cols-2">
              <AboutCard
                icon={<Sparkles />}
                title="AI Intelligence"
                text="Let AI analyze conversations and surface useful insights."
                darkMode={darkMode}
              />

              <AboutCard
                icon={<Zap />}
                title="Faster Responses"
                text="Generate useful replies without starting from scratch."
                darkMode={darkMode}
              />

              <AboutCard
                icon={<Target />}
                title="Lead Focus"
                text="Prioritize conversations based on customer intent."
                darkMode={darkMode}
              />

              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-6 sm:translate-y-5">
                <div className="text-3xl font-bold text-indigo-500">
                  AI
                </div>

                <div
                  className={
                    darkMode
                      ? "mt-2 text-sm font-semibold"
                      : "mt-2 text-sm font-semibold text-slate-900"
                  }
                >
                  Built around your workflow
                </div>

                <p
                  className={
                    darkMode
                      ? "mt-2 text-xs leading-5 text-slate-500"
                      : "mt-2 text-xs leading-5 text-slate-600"
                  }
                >
                  Intelligent assistance without replacing the
                  human connection.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SERVICES */}
      {/* ========================================================= */}

      <section
        id="services"
        className={
          darkMode
            ? "bg-white/[0.015] px-6 py-28"
            : "bg-slate-100/70 px-6 py-28"
        }
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="SERVICES"
            title="Everything you need to"
            highlight="reply smarter."
            description="ReplyFlow combines AI assistance, customer intelligence, and conversation management into one simple platform."
            darkMode={darkMode}
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<Bot />}
              title="AI Reply Assistant"
              description="Generate natural, professional replies based on the context of each customer conversation."
              darkMode={darkMode}
            />

            <ServiceCard
              icon={<TrendingUp />}
              title="Lead Scoring"
              description="Identify conversations with strong purchase intent so your team knows where to focus."
              darkMode={darkMode}
            />

            <ServiceCard
              icon={<Sparkles />}
              title="Conversation Intelligence"
              description="Extract useful insights from customer conversations and understand what matters."
              darkMode={darkMode}
            />

            <ServiceCard
              icon={<Inbox />}
              title="Unified Inbox"
              description="Keep customer conversations organized in one clean workspace designed for speed."
              darkMode={darkMode}
            />

            <ServiceCard
              icon={<Users />}
              title="Customer Profiles"
              description="See relevant customer information alongside conversations to provide better support."
              darkMode={darkMode}
            />

            <ServiceCard
              icon={<CheckCircle2 />}
              title="Human-in-the-loop"
              description="AI assists your team while keeping people in control of the final customer response."
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW IT WORKS */}
      {/* ========================================================= */}

      <section id="how-it-works" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="HOW IT WORKS"
            title="From conversation to"
            highlight="action."
            description="A simple workflow designed to help your team move faster without losing the human touch."
            darkMode={darkMode}
          />

          <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
            <div className="absolute left-[17%] right-[17%] top-14 hidden h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent lg:block" />

            <StepCard
              number="01"
              icon={<MessageCircle />}
              title="Connect conversations"
              description="Bring your customer conversations into a single organized workspace."
              darkMode={darkMode}
            />

            <StepCard
              number="02"
              icon={<Bot />}
              title="Let AI assist"
              description="ReplyFlow analyzes conversations and generates helpful response suggestions."
              darkMode={darkMode}
            />

            <StepCard
              number="03"
              icon={<TrendingUp />}
              title="Focus on opportunities"
              description="Use AI insights and lead scores to prioritize the conversations that matter."
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRICING */}
      {/* ========================================================= */}

      <section
        id="pricing"
        className={
          darkMode
            ? "bg-white/[0.015] px-6 py-28"
            : "bg-slate-100/70 px-6 py-28"
        }
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="PRICING"
            title="Simple plans."
            highlight="No surprises."
            description="Start free and upgrade when your customer conversations grow."
            darkMode={darkMode}
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="Rs. 0"
              description="For individuals exploring AI-assisted customer support."
              features={[
                "100 conversations / month",
                "AI reply suggestions",
                "Basic inbox",
                "Basic lead scoring",
              ]}
              darkMode={darkMode}
            />

            <PricingCard
              name="Growth"
              price="Rs. 8,500"
              popular
              description="For small teams ready to scale customer conversations."
              features={[
                "Unlimited conversations",
                "Advanced AI replies",
                "Lead scoring",
                "Conversation insights",
                "Customer profiles",
                "Priority support",
              ]}
              darkMode={darkMode}
            />

            <PricingCard
              name="Business"
              price="Rs. 23,000"
              description="For growing businesses with larger support workflows."
              features={[
                "Everything in Growth",
                "Multiple team members",
                "Advanced analytics",
                "Custom workflows",
                "Priority AI processing",
                "Dedicated support",
              ]}
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CONTACT */}
      {/* ========================================================= */}

      <section id="contact" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={
              darkMode
                ? "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/15 via-slate-900 to-blue-600/10 p-8 sm:p-12"
                : "relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 shadow-xl sm:p-12"
            }
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Contact Info */}

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Let&apos;s talk
                </div>

                <h2
                  className={
                    darkMode
                      ? "text-3xl font-bold sm:text-4xl"
                      : "text-3xl font-bold text-slate-950 sm:text-4xl"
                  }
                >
                  Ready to make every

                  <span className="block text-indigo-500">
                    conversation count?
                  </span>
                </h2>

                <p
                  className={
                    darkMode
                      ? "mt-5 max-w-lg text-sm leading-6 text-slate-400"
                      : "mt-5 max-w-lg text-sm leading-6 text-slate-600"
                  }
                >
                  Have a question about ReplyFlow? Send us a
                  message and our team will get back to you.
                </p>

                <div className="mt-8 space-y-4">
                  <ContactCard
                    icon={<MessageSquare />}
                    title="Customer Support"
                    text="Get help with your ReplyFlow workspace."
                    darkMode={darkMode}
                  />

                  <ContactCard
                    icon={<Zap />}
                    title="Product Questions"
                    text="Ask about features, plans, and integrations."
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Contact Form */}

              <form
                onSubmit={handleContactSubmit}
                className={
                  darkMode
                    ? "rounded-2xl border border-white/10 bg-black/20 p-6"
                    : "rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
                }
              >
                <div className="mb-6">
                  <h3
                    className={
                      darkMode
                        ? "text-lg font-semibold"
                        : "text-lg font-semibold text-slate-950"
                    }
                  >
                    Send us a message
                  </h3>

                  <p
                    className={
                      darkMode
                        ? "mt-1 text-xs text-slate-500"
                        : "mt-1 text-xs text-slate-500"
                    }
                  >
                    We&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className={
                        darkMode
                          ? "mb-2 block text-xs font-medium text-slate-400"
                          : "mb-2 block text-xs font-medium text-slate-600"
                      }
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                          : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className={
                        darkMode
                          ? "mb-2 block text-xs font-medium text-slate-400"
                          : "mb-2 block text-xs font-medium text-slate-600"
                      }
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                          : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className={
                        darkMode
                          ? "mb-2 block text-xs font-medium text-slate-400"
                          : "mb-2 block text-xs font-medium text-slate-600"
                      }
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="How can we help?"
                      className={
                        darkMode
                          ? "w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                          : "w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    {contactSent
                      ? "Opening email..."
                      : "Send Message"}

                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>

                  <p
                    className={
                      darkMode
                        ? "text-center text-[10px] text-slate-600"
                        : "text-center text-[10px] text-slate-500"
                    }
                  >
                    This will open your default email application.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer
        className={
          darkMode
            ? "border-t border-white/10 px-6 py-12"
            : "border-t border-slate-200 bg-white px-6 py-12"
        }
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>

                <div>
                  <div
                    className={
                      darkMode
                        ? "text-sm font-bold"
                        : "text-sm font-bold text-slate-950"
                    }
                  >
                    ReplyFlow
                  </div>

                  <div className="text-[10px] text-slate-500">
                    AI Customer Assistant
                  </div>
                </div>
              </Link>

              <p
                className={
                  darkMode
                    ? "mt-5 max-w-sm text-xs leading-6 text-slate-500"
                    : "mt-5 max-w-sm text-xs leading-6 text-slate-500"
                }
              >
                AI-powered customer conversation management for
                modern small businesses.
              </p>

              <div className="mt-5 text-xs text-slate-500">
                Built with AI. Designed for humans.
              </div>
            </div>

            <div>
              <div
                className={
                  darkMode
                    ? "mb-4 text-xs font-semibold"
                    : "mb-4 text-xs font-semibold text-slate-900"
                }
              >
                Product
              </div>

              <div className="space-y-3">
                <FooterLink href="#services" darkMode={darkMode}>
                  Features
                </FooterLink>

                <FooterLink href="#pricing" darkMode={darkMode}>
                  Pricing
                </FooterLink>

                <FooterLink
                  href="#how-it-works"
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

            <div>
              <div
                className={
                  darkMode
                    ? "mb-4 text-xs font-semibold"
                    : "mb-4 text-xs font-semibold text-slate-900"
                }
              >
                Company
              </div>

              <div className="space-y-3">
                <FooterLink href="#about" darkMode={darkMode}>
                  About
                </FooterLink>

                <FooterLink href="#contact" darkMode={darkMode}>
                  Contact
                </FooterLink>

                <FooterLink href="/login" darkMode={darkMode}>
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

          <div
            className={
              darkMode
                ? "mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-[10px] text-slate-600 sm:flex-row"
                : "mt-12 flex flex-col justify-between gap-4 border-t border-slate-200 pt-7 text-[10px] text-slate-500 sm:flex-row"
            }
          >
            <span>
              © {new Date().getFullYear()} ReplyFlow. All
              rights reserved.
            </span>

            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================= */
/* NAV LINK */
/* ============================================================= */

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

/* ============================================================= */
/* MINI NAV */
/* ============================================================= */

function MiniNav({
  icon,
  text,
  active = false,
  darkMode,
}: {
  icon: ReactNode;
  text: string;
  active?: boolean;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[9px] ${
        active
          ? "bg-indigo-500/10 text-indigo-500"
          : darkMode
            ? "text-slate-600"
            : "text-slate-400"
      }`}
    >
      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      {text}
    </div>
  );
}

/* ============================================================= */
/* STAT */
/* ============================================================= */

function Stat({
  icon,
  value,
  label,
  darkMode,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  darkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="mb-3 flex justify-center text-indigo-500">
        <span className="[&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
      </div>

      <div
        className={
          darkMode
            ? "text-3xl font-bold"
            : "text-3xl font-bold text-slate-950"
        }
      >
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {label}
      </div>
    </motion.div>
  );
}

/* ============================================================= */
/* ABOUT CARD */
/* ============================================================= */

function AboutCard({
  icon,
  title,
  text,
  darkMode,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={
        darkMode
          ? "rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      }
    >
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
        {icon}
      </div>

      <h3
        className={
          darkMode
            ? "text-sm font-semibold"
            : "text-sm font-semibold text-slate-950"
        }
      >
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* ============================================================= */
/* SECTION HEADING */
/* ============================================================= */

function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  darkMode,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-4 text-xs font-semibold tracking-widest text-indigo-500">
        {eyebrow}
      </div>

      <h2
        className={
          darkMode
            ? "text-3xl font-bold sm:text-4xl"
            : "text-3xl font-bold text-slate-950 sm:text-4xl"
        }
      >
        {title}

        <span className="text-indigo-500">
          {" "}
          {highlight}
        </span>
      </h2>

      <p
        className={
          darkMode
            ? "mt-4 text-sm leading-6 text-slate-400 sm:text-base"
            : "mt-4 text-sm leading-6 text-slate-600 sm:text-base"
        }
      >
        {description}
      </p>
    </div>
  );
}

/* ============================================================= */
/* SERVICE CARD */
/* ============================================================= */

function ServiceCard({
  icon,
  title,
  description,
  darkMode,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={
        darkMode
          ? "group rounded-2xl border border-white/10 bg-slate-950/50 p-6 transition hover:border-indigo-500/30 hover:bg-white/[0.04]"
          : "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
      }
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 transition group-hover:bg-indigo-500/20">
        {icon}
      </div>

      <h3
        className={
          darkMode
            ? "mt-6 text-base font-semibold"
            : "mt-6 text-base font-semibold text-slate-950"
        }
      >
        {title}
      </h3>

      <p
        className={
          darkMode
            ? "mt-3 text-sm leading-6 text-slate-500"
            : "mt-3 text-sm leading-6 text-slate-600"
        }
      >
        {description}
      </p>
    </motion.div>
  );
}

/* ============================================================= */
/* STEP CARD */
/* ============================================================= */

function StepCard({
  number,
  icon,
  title,
  description,
  darkMode,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  darkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={
        darkMode
          ? "relative rounded-2xl border border-white/10 bg-white/[0.025] p-7 text-center"
          : "relative rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"
      }
    >
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
        {icon}

        <span
          className={
            darkMode
              ? "absolute -right-2 -top-2 rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-[9px] font-bold text-slate-500"
              : "absolute -right-2 -top-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500"
          }
        >
          {number}
        </span>
      </div>

      <h3
        className={
          darkMode
            ? "mt-7 text-base font-semibold"
            : "mt-7 text-base font-semibold text-slate-950"
        }
      >
        {title}
      </h3>

      <p
        className={
          darkMode
            ? "mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500"
            : "mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-600"
        }
      >
        {description}
      </p>
    </motion.div>
  );
}

/* ============================================================= */
/* PRICING CARD */
/* ============================================================= */

function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
  darkMode,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  darkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl border p-7 ${
        popular
          ? "border-indigo-500/50 bg-indigo-500/[0.07] shadow-xl shadow-indigo-950/20"
          : darkMode
            ? "border-white/10 bg-slate-950/50"
            : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {popular && (
        <div className="absolute right-5 top-5 rounded-full bg-indigo-500/15 px-2.5 py-1 text-[9px] font-semibold text-indigo-500">
          MOST POPULAR
        </div>
      )}

      <h3
        className={
          darkMode
            ? "text-lg font-semibold"
            : "text-lg font-semibold text-slate-950"
        }
      >
        {name}
      </h3>

      <p
        className={
          darkMode
            ? "mt-3 min-h-[48px] text-xs leading-5 text-slate-500"
            : "mt-3 min-h-[48px] text-xs leading-5 text-slate-600"
        }
      >
        {description}
      </p>

      <div className="mt-7">
        <span
          className={
            darkMode
              ? "text-4xl font-bold"
              : "text-4xl font-bold text-slate-950"
          }
        >
          {price}
        </span>

        {price !== "Rs. 0" && (
          <span className="ml-1 text-sm text-slate-500">
            /month
          </span>
        )}
      </div>

      <Link
        href="/register"
        className={`mt-7 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
          popular
            ? "bg-indigo-600 text-white hover:bg-indigo-500"
            : darkMode
              ? "border border-white/10 bg-white/5 hover:bg-white/10"
              : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
        }`}
      >
        Get started
      </Link>

      <div
        className={
          darkMode
            ? "mt-7 border-t border-white/10 pt-6"
            : "mt-7 border-t border-slate-200 pt-6"
        }
      >
        <div
          className={
            darkMode
              ? "mb-4 text-xs font-semibold"
              : "mb-4 text-xs font-semibold text-slate-900"
          }
        >
          Includes:
        </div>

        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-2"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />

              <span
                className={
                  darkMode
                    ? "text-xs text-slate-400"
                    : "text-xs text-slate-600"
                }
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================= */
/* CONTACT CARD */
/* ============================================================= */

function ContactCard({
  icon,
  title,
  text,
  darkMode,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={
        darkMode
          ? "rounded-2xl border border-white/10 bg-black/20 p-5"
          : "rounded-2xl border border-slate-200 bg-white/70 p-5"
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
          {icon}
        </div>

        <div>
          <div
            className={
              darkMode
                ? "text-sm font-semibold"
                : "text-sm font-semibold text-slate-950"
            }
          >
            {title}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* FOOTER LINK */
/* ============================================================= */

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