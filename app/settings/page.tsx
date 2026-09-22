"use client";

import {
  Check,
  LogOut,
  Save,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import { supabase } from "@/lib/supabase/client";

type Tone =
  | "Professional"
  | "Friendly"
  | "Empathetic"
  | "Concise";

type ReplyLength =
  | "Short"
  | "Medium"
  | "Detailed";

export default function SettingsPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    mounted && resolvedTheme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [tone, setTone] =
    useState<Tone>("Professional");

  const [replyLength, setReplyLength] =
    useState<ReplyLength>("Medium");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        const metadata =
          user.user_metadata || {};

        setName(
          typeof metadata.full_name ===
            "string"
            ? metadata.full_name
            : ""
        );

        setEmail(user.email || "");

        const storedTone =
          localStorage.getItem(
            "replyflow_ai_tone"
          );

        const storedLength =
          localStorage.getItem(
            "replyflow_ai_reply_length"
          );

        if (
          storedTone === "Professional" ||
          storedTone === "Friendly" ||
          storedTone === "Empathetic" ||
          storedTone === "Concise"
        ) {
          setTone(storedTone);
        }

        if (
          storedLength === "Short" ||
          storedLength === "Medium" ||
          storedLength === "Detailed"
        ) {
          setReplyLength(storedLength);
        }
      } catch (error) {
        console.error(
          "Load settings error:",
          error
        );

        setErrorMessage(
          "Unable to load your settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
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

      const cleanName = name.trim();

      if (!cleanName) {
        setErrorMessage(
          "Please enter your name."
        );
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            full_name: cleanName,
          },
        });

      if (error) {
        throw error;
      }

      localStorage.setItem(
        "replyflow_ai_tone",
        tone
      );

      localStorage.setItem(
        "replyflow_ai_reply_length",
        replyLength
      );

      setName(cleanName);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Save settings error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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

        <main className="flex min-h-screen items-center justify-center pt-[76px] lg:pl-[260px]">
          <div
            className={`text-sm ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Loading settings...
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
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isDark
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <Settings size={20} />
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Settings
              </h1>
            </div>

            <p
              className={
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            >
              Manage your profile, AI preferences,
              and appearance.
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm ${
                isDark
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {saved && (
            <div
              className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm ${
                isDark
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <Check size={17} />
              Settings saved successfully.
            </div>
          )}

          <div className="space-y-6">

            {/* Profile */}
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
                  <User size={19} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Profile
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your ReplyFlow account
                    information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full name
                  </label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Your name"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      isDark
                        ? "border-white/10 bg-[#0d0d1a] text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400"
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    value={email}
                    disabled
                    className={`w-full cursor-not-allowed rounded-xl border px-4 py-3 text-sm ${
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-slate-500"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Email is managed by your
                    authentication account.
                  </p>
                </div>
              </div>
            </section>

            {/* AI Preferences */}
            <section
              className={`rounded-2xl border p-6 ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-6">
                <h2 className="font-semibold">
                  AI Preferences
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose how ReplyFlow AI should
                  draft suggested replies.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                {/* Tone */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Default tone
                  </label>

                  <select
                    value={tone}
                    onChange={(event) =>
                      setTone(
                        event.target
                          .value as Tone
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      isDark
                        ? "border-white/10 bg-[#0d0d1a] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  >
                    <option value="Professional">
                      Professional
                    </option>

                    <option value="Friendly">
                      Friendly
                    </option>

                    <option value="Empathetic">
                      Empathetic
                    </option>

                    <option value="Concise">
                      Concise
                    </option>
                  </select>
                </div>

                {/* Reply Length */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Reply length
                  </label>

                  <select
                    value={replyLength}
                    onChange={(event) =>
                      setReplyLength(
                        event.target
                          .value as ReplyLength
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                      isDark
                        ? "border-white/10 bg-[#0d0d1a] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  >
                    <option value="Short">
                      Short
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Detailed">
                      Detailed
                    </option>
                  </select>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section
              className={`rounded-2xl border p-6 ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-6">
                <h2 className="font-semibold">
                  Appearance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose how ReplyFlow looks on
                  your device.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {/* Light */}
                <button
                  type="button"
                  onClick={() =>
                    setTheme("light")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    !isDark
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <p className="font-semibold">
                    Light
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Bright and clean interface.
                  </p>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() =>
                    setTheme("dark")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    isDark
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <p className="font-semibold">
                    Dark
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Comfortable interface for
                    low-light environments.
                  </p>
                </button>
              </div>
            </section>

            {/* Account */}
            <section
              className={`rounded-2xl border p-6 ${
                isDark
                  ? "border-white/10 bg-[#141827]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="font-semibold">
                Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your current ReplyFlow
                session.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  isDark
                    ? "border-red-500/20 text-red-300 hover:bg-red-500/10"
                    : "border-red-200 text-red-600 hover:bg-red-50"
                }`}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </section>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}

