"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Sparkles,
  Copy,
  Download,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Briefcase,
  Building,
  ChevronRight,
} from "lucide-react";

interface CoverLetterItem {
  _id: string;
  companyName: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function CoverLetterPage() {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");

  const [letters, setLetters] = useState<CoverLetterItem[]>([]);
  const [activeLetter, setActiveLetter] = useState<CoverLetterItem | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchLetters = async () => {
    try {
      const res = await fetch("/api/cover-letter");
      if (res.ok) {
        const data = await res.json();
        setLetters(data);
        if (data.length > 0) {
          setActiveLetter(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !skillsInput.trim() || !experienceInput.trim()) {
      setError("Please fill in all input fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const skillsArray = skillsInput.split(",").map((s) => s.trim());
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          role,
          skills: skillsArray,
          experience: experienceInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate cover letter");
      } else {
        setLetters((prev) => [data, ...prev]);
        setActiveLetter(data);
        // Clear inputs
        setCompanyName("");
        setRole("");
        setSkillsInput("");
        setExperienceInput("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to call AI microservice. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeLetter) return;
    navigator.clipboard.writeText(activeLetter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeLetter) return;
    const element = document.createElement("a");
    const file = new Blob([activeLetter.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeLetter.companyName}_${activeLetter.role}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="relative z-10 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <Mail className="w-8 h-8 text-brand-500" />
          <span>Cover Letter Generator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Draft highly personalized, professional cover letters targeting any role and company in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO COLUMNS: INPUTS & EDITABLE RESULT */}
        <div className="xl:col-span-2 space-y-6">
          {/* Input Box */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-brand-500 animate-pulse" />
              <span>Input Parameters</span>
            </h3>

            {error && (
              <div className="mb-4 flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Vercel"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-1">
                    Job Role Target
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-1">
                  Key Skills (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Next.js, React, Tailwind CSS, TypeScript"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-1">
                  Experience Highlights
                </label>
                <textarea
                  rows={4}
                  required
                  value={experienceInput}
                  onChange={(e) => setExperienceInput(e.target.value)}
                  placeholder="Summarize your years of experience, key achievements, or unique projects you'd like the AI to align..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating letter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate Letter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* EDITABLE LETTER PREVIEW */}
          <AnimatePresence mode="wait">
            {activeLetter && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-150 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>{activeLetter.role} — {activeLetter.companyName}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Drafted on {new Date(activeLetter.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 transition flex items-center justify-center"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 transition flex items-center justify-center"
                      title="Download text file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={12}
                    value={activeLetter.content}
                    onChange={(e) => {
                      const updated = { ...activeLetter, content: e.target.value };
                      setActiveLetter(updated);
                      setLetters((prev) => prev.map((l) => (l._id === activeLetter._id ? updated : l)));
                    }}
                    className="w-full p-4 rounded-2xl border-none focus:outline-none bg-slate-50/50 dark:bg-slate-900/10 text-xs font-mono text-slate-800 dark:text-slate-250 leading-relaxed resize-y"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            <span>Letter Archive</span>
          </h3>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-450" />
            </div>
          ) : letters.length === 0 ? (
            <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-12">
              No previous cover letters. Generate one to start archiving.
            </p>
          ) : (
            <div className="space-y-3">
              {letters.map((l) => (
                <button
                  key={l._id}
                  onClick={() => setActiveLetter(l)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between group ${
                    activeLetter?._id === l._id
                      ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                      : "border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/10"
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {l.role}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center truncate">
                      <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {l.companyName}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
