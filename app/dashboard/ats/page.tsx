"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ListRestart,
  ArrowRight,
  TrendingUp,
  BookOpen,
  History,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface ATSReportItem {
  _id: string;
  score: number;
  jobDescription: string;
  missingKeywords: string[];
  formattingSuggestions: string[];
  skillGapAnalysis: string[];
  improvementTips: string[];
  createdAt: string;
}

export default function ATSCheckerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [reports, setReports] = useState<ATSReportItem[]>([]);
  const [activeReport, setActiveReport] = useState<ATSReportItem | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/ats");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0) {
          setActiveReport(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to analyze score");
      } else {
        setReports((prev) => [data, ...prev]);
        setActiveReport(data);
        // Clear input
        setJobDescription("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to run ATS scanner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500";
    if (score >= 60) return "text-indigo-500 stroke-indigo-500";
    return "text-amber-500 stroke-amber-500";
  };

  return (
    <div className="relative z-10 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <Scan className="w-8 h-8 text-brand-500" />
          <span>ATS Score Checker</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scan your resume against any job description to discover keywords, formatting guidelines, and skill gaps.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO COLUMNS: INPUT & ACTIVE REPORT */}
        <div className="xl:col-span-2 space-y-8">
          {/* Input Panel */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-brand-500" />
              <span>Scan New Application</span>
            </h3>

            {error && (
              <div className="mb-4 flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Paste Resume Content
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your plain text resume content here... Include experience descriptions, projects, and skills."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Paste Job Description
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description from LinkedIn, Indeed, or company career page here..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning resume keywords...</span>
                    </>
                  ) : (
                    <>
                      <span>Scan Resume</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ACTIVE REPORT PANEL */}
          <AnimatePresence mode="wait">
            {activeReport && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Score Summary Banner */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between overflow-hidden relative">
                  {/* Glowing background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center space-x-5">
                    {/* SVG Progress Wheel */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100 dark:text-slate-800"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`transition-all duration-1000 ${getScoreColor(activeReport.score)}`}
                          strokeWidth="3.5"
                          strokeDasharray={`${activeReport.score}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xl text-slate-800 dark:text-white">
                        {activeReport.score}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Analysis Score</h3>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 max-w-sm">
                        {activeReport.score >= 80
                          ? "Excellent! Your resume matches the job description guidelines very well."
                          : activeReport.score >= 60
                          ? "Good base! Integrate missing keywords and follow the formatting guidelines below to raise your score above 80%."
                          : "High skill gap. Re-read the job description and align your experience descriptions and projects details."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      ATS Optimized
                    </span>
                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-slate-150 text-slate-650 dark:bg-slate-800 dark:text-slate-400">
                      Scan: {new Date(activeReport.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Analysis Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Missing Keywords */}
                  <div className="glass-panel p-6 rounded-3xl space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>Missing Keywords</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Recruiter screening algorithms search for these specific terms. Integrate them naturally.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {activeReport.missingKeywords?.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/15 text-red-550 dark:text-red-400 text-xs font-semibold"
                        >
                          {kw}
                        </span>
                      ))}
                      {(!activeReport.missingKeywords || activeReport.missingKeywords.length === 0) && (
                        <span className="text-xs text-slate-450 dark:text-slate-500">None! You matched all keywords.</span>
                      )}
                    </div>
                  </div>

                  {/* Formatting Suggestions */}
                  <div className="glass-panel p-6 rounded-3xl space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                      <span>Formatting Suggestions</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Ensure your layout is machine-readable and parsers don&apos;t experience bottlenecks.
                    </p>
                    <ul className="space-y-2 pt-1">
                      {activeReport.formattingSuggestions?.map((sug, idx) => (
                        <li key={idx} className="text-xs text-slate-650 leading-relaxed flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-1.5 flex-shrink-0" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skill Gap Analysis */}
                  <div className="glass-panel p-6 rounded-3xl space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                      <span>Skill Gap Roadmap</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      A gap analysis mapping your resume elements against required skills on the job description.
                    </p>
                    <ul className="space-y-2.5 pt-1">
                      {activeReport.skillGapAnalysis?.map((gap, idx) => (
                        <li key={idx} className="text-xs text-slate-650 leading-relaxed flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvement Tips */}
                  <div className="glass-panel p-6 rounded-3xl space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                      <ListRestart className="w-4 h-4 mr-2 text-brand-500" />
                      <span>Actionable Improvements</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Step-by-step tips to rewrite descriptions and emphasize your contribution metrics.
                    </p>
                    <ul className="space-y-2 pt-1">
                      {activeReport.improvementTips?.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-650 leading-relaxed flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: PREVIOUS SCAN HISTORY */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
            <History className="w-4 h-4 mr-2 text-slate-400" />
            <span>Scan History</span>
          </h3>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-12">
              No previous reports found. Run a scan on the left.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <button
                  key={rep._id}
                  onClick={() => setActiveReport(rep)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between group ${
                    activeReport?._id === rep._id
                      ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                      : "border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/10"
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-205 truncate">
                      {rep.jobDescription.substring(0, 45)}...
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    rep.score >= 80
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
                      : rep.score >= 60
                      ? "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-450"
                  }`}>
                    {rep.score}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
