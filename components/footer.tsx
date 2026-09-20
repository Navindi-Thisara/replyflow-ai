import Link from "next/link";
import { Bot, Linkedin, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-10 md:grid-cols-4">

          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Bot className="h-5 w-5" />
              </div>

              <span className="font-bold">ReplyFlow AI</span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              AI-powered customer conversations that help businesses respond
              faster, identify valuable leads, and grow sales.
            </p>

            <div className="mt-6 flex gap-2">
              <SocialIcon icon={<Twitter />} />
              <SocialIcon icon={<Linkedin />} />
              <SocialIcon icon={<Github />} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Product</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <a href="#services">AI Replies</a>
              <a href="#services">Lead Scoring</a>
              <a href="#services">Analytics</a>
              <a href="#pricing">Pricing</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Company</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          </div>

        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 sm:flex-row">
          <p>© 2026 ReplyFlow AI. All rights reserved.</p>

          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:text-slate-400">
      {icon}
    </button>
  );
}