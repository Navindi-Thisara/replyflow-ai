"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = mounted && resolvedTheme !== "light";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email =
        "Please enter a valid email address containing @.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrors({
          general: "Invalid email address or password.",
        });

        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        general:
          "Something went wrong while signing you in. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        darkMode
          ? "bg-[#070b17] text-white"
          : "bg-slate-50 text-slate-950"
      }`}
    >
      {/* Shared Navbar */}
      <Navbar />

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl ${
            darkMode
              ? "bg-indigo-600/10"
              : "bg-indigo-300/20"
          }`}
        />

        <div
          className={`absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full blur-3xl ${
            darkMode
              ? "bg-cyan-600/5"
              : "bg-blue-200/20"
          }`}
        />
      </div>

      {/* Login content */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-20 pt-32">
        <div className="w-full max-w-md">

          {/* Back to home */}
          <Link
            href="/"
            className={`mb-8 inline-flex items-center gap-2 text-sm transition ${
              darkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <div
              className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                darkMode
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <LogIn className="h-6 w-6" />
            </div>

            <h1
              className={`text-3xl font-bold tracking-tight ${
                darkMode
                  ? "text-white"
                  : "text-slate-950"
              }`}
            >
              Welcome back
            </h1>

            <p
              className={`mt-2 text-sm ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Sign in to continue managing your customer
              conversations with ReplyFlow AI.
            </p>
          </div>

          {/* Card */}
          <div
            className={`rounded-3xl border p-6 shadow-2xl sm:p-8 ${
              darkMode
                ? "border-white/10 bg-white/[0.04] shadow-black/20"
                : "border-slate-200 bg-white shadow-slate-200/60"
            }`}
          >
            {/* General error */}
            {errors.general && (
              <div
                className={`mb-6 flex gap-3 rounded-xl border p-4 text-sm ${
                  darkMode
                    ? "border-red-400/20 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <span>{errors.general}</span>
              </div>
            )}

            <form
              onSubmit={handleLogin}
              noValidate
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (errors.email) {
                        setErrors((previous) => ({
                          ...previous,
                          email: undefined,
                        }));
                      }

                      if (errors.general) {
                        setErrors((previous) => ({
                          ...previous,
                          general: undefined,
                        }));
                      }
                    }}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm outline-none transition ${
                      errors.email
                        ? "border-red-500"
                        : darkMode
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium ${
                      darkMode
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-500 transition hover:text-indigo-400"
                    onClick={() => {
                      setErrors({
                        general:
                          "Password reset is not configured yet.",
                      });
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (errors.password) {
                        setErrors((previous) => ({
                          ...previous,
                          password: undefined,
                        }));
                      }

                      if (errors.general) {
                        setErrors((previous) => ({
                          ...previous,
                          general: undefined,
                        }));
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border py-3.5 pl-12 pr-12 text-sm outline-none transition ${
                      errors.password
                        ? "border-red-500"
                        : darkMode
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      darkMode
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                  />

                  <span
                    className={`text-xs ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Remember me
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </span>
                )}
              </button>
            </form>

            {/* Register */}
            <div
              className={`mt-7 border-t pt-6 text-center text-sm ${
                darkMode
                  ? "border-white/10 text-slate-400"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-indigo-500 hover:text-indigo-400"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Security note */}
          <p
            className={`mt-6 text-center text-xs ${
              darkMode
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            Your credentials are securely managed by
            Supabase Authentication.
          </p>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </main>
  );
}