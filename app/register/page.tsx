"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function RegisterPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = mounted && resolvedTheme !== "light";

  const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordValid =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.fullName = "Full name is required.";
    } else if (!nameRegex.test(trimmedName)) {
      newErrors.fullName =
        "Name can contain letters and spaces only.";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email =
        "Please enter a valid email address containing @.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRequirements.minLength) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    } else if (!passwordRequirements.uppercase) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!passwordRequirements.number) {
      newErrors.password =
        "Password must contain at least one number.";
    } else if (!passwordRequirements.special) {
      newErrors.password =
        "Password must contain at least one special character.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!acceptedTerms) {
      newErrors.terms =
        "You must agree to the Terms & Conditions.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanName = fullName.trim();
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
              emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setErrors({
          general: error.message,
        });

        setIsSubmitting(false);
        return;
      }

      if (data.user && !data.session) {
        setSuccessMessage(
          "Account created successfully. Please check your email to confirm your account."
        );

        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAcceptedTerms(false);
        setIsSubmitting(false);

        return;
      }

      if (data.user) {
        setSuccessMessage(
          "Account created successfully! Redirecting to login..."
        );

        setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } catch (error) {
      console.error("Registration error:", error);

      setErrors({
        general:
          "Something went wrong while creating your account. Please try again.",
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

      {/* Register content */}
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
              <User className="h-6 w-6" />
            </div>

            <h1
              className={`text-3xl font-bold tracking-tight ${
                darkMode
                  ? "text-white"
                  : "text-slate-950"
              }`}
            >
              Create your account
            </h1>

            <p
              className={`mt-2 text-sm ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Start managing your customer conversations
              with ReplyFlow AI.
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

            {/* Success */}
            {successMessage && (
              <div
                className={`mb-6 flex gap-3 rounded-xl border p-4 text-sm ${
                  darkMode
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <span>{successMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleRegister}
              noValidate
              className="space-y-5"
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);

                      if (errors.fullName) {
                        setErrors((previous) => ({
                          ...previous,
                          fullName: undefined,
                        }));
                      }
                    }}
                    placeholder="Navindi Thisara"
                    className={`w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm outline-none transition ${
                      errors.fullName
                        ? "border-red-500"
                        : darkMode
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>

                {errors.fullName && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.fullName}
                  </p>
                )}
              </div>

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
                <label
                  htmlFor="password"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Password
                </label>

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
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (errors.password) {
                        setErrors((previous) => ({
                          ...previous,
                          password: undefined,
                        }));
                      }
                    }}
                    placeholder="Create a strong password"
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

                {/* Password requirements */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <PasswordRequirement
                    valid={passwordRequirements.minLength}
                    text="At least 8 characters"
                    darkMode={darkMode}
                  />

                  <PasswordRequirement
                    valid={passwordRequirements.uppercase}
                    text="One uppercase letter"
                    darkMode={darkMode}
                  />

                  <PasswordRequirement
                    valid={passwordRequirements.number}
                    text="One number"
                    darkMode={darkMode}
                  />

                  <PasswordRequirement
                    valid={passwordRequirements.special}
                    text="One special character"
                    darkMode={darkMode}
                  />
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );

                      if (errors.confirmPassword) {
                        setErrors((previous) => ({
                          ...previous,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    placeholder="Repeat your password"
                    className={`w-full rounded-xl border py-3.5 pl-12 pr-12 text-sm outline-none transition ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : darkMode
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500"
                        : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-indigo-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      darkMode
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}

                {confirmPassword &&
                  password === confirmPassword &&
                  passwordValid && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                      <Check className="h-3.5 w-3.5" />
                      Passwords match
                    </p>
                  )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(
                        event.target.checked
                      );

                      if (errors.terms) {
                        setErrors((previous) => ({
                          ...previous,
                          terms: undefined,
                        }));
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
                  />

                  <span
                    className={`text-xs leading-5 ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    I agree to{" "}
                    <span className="font-medium text-indigo-500">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-indigo-500">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>

                {errors.terms && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.terms}
                  </p>
                )}
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login */}
            <div
              className={`mt-7 border-t pt-6 text-center text-sm ${
                darkMode
                  ? "border-white/10 text-slate-400"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-indigo-500 hover:text-indigo-400"
              >
                Log in
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
            Your account credentials are securely managed
            by Supabase Authentication.
          </p>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </main>
  );
}

function PasswordRequirement({
  valid,
  text,
  darkMode,
}: {
  valid: boolean;
  text: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid
          ? "text-emerald-500"
          : darkMode
          ? "text-slate-500"
          : "text-slate-400"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-500/10"
            : darkMode
            ? "bg-white/5"
            : "bg-slate-100"
        }`}
      >
        {valid && <Check className="h-3 w-3" />}
      </span>

      {text}
    </div>
  );
}
