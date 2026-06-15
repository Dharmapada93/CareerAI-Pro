import React from "react";
import Link from "next/link";
import { Briefcase, Globe, Link2, Send, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-dark-600/30 py-12 px-4 z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
              CareerAI Pro
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Elevate your career trajectory with our AI-powered suite. Craft premium ATS-optimized resumes, practice real-time interviews, and unlock your dream role.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-slate-400 hover:text-brand-500 transition"><Globe className="w-4 h-4" /></a>
            <a href="#" className="text-slate-400 hover:text-brand-500 transition"><Link2 className="w-4 h-4" /></a>
            <a href="#" className="text-slate-400 hover:text-brand-500 transition"><Send className="w-4 h-4" /></a>
            <a href="#" className="text-slate-400 hover:text-brand-500 transition"><Mail className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            Resources
          </h3>
          <ul className="space-y-2.5">
            <li><Link href="/dashboard/resume" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">AI Resume Builder</Link></li>
            <li><Link href="/dashboard/ats" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">ATS Score Checker</Link></li>
            <li><Link href="/dashboard/interview" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">AI Mock Interviews</Link></li>
            <li><Link href="/dashboard/portfolio" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">Portfolio Generator</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            Company
          </h3>
          <ul className="space-y-2.5">
            <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">Pricing Plans</Link></li>
            <li><a href="#" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">Terms of Service</a></li>
            <li><a href="#" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 transition">Contact Support</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            Stay Updated
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Subscribe to receive career growth newsletters and product updates.
          </p>
          <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 rounded-xl text-xs glass-input w-full focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-800/40 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} CareerAI Pro. All rights reserved. Created with passion for students & freshers.
        </p>
      </div>
    </footer>
  );
}
