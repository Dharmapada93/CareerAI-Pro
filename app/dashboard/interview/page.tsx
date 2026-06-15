"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  Plus,
  Calendar,
  Award,
  Loader2,
  ChevronRight,
  UserCheck,
} from "lucide-react";

interface InterviewSessionItem {
  _id: string;
  role: string;
  experienceLevel: string;
  status: "pending" | "completed";
  overallScores?: {
    technical: number;
    communication: number;
    confidence: number;
  };
  createdAt: string;
}

export default function InterviewSetupPage() {
  const router = useRouter();
  
  const [sessions, setSessions] = useState<InterviewSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedLevel, setSelectedLevel] = useState("Junior");
  const [startLoading, setStartLoading] = useState(false);

  const roles = [
    "Frontend Developer",
    "Full Stack Developer",
    "Backend Developer",
    "Data Analyst",
    "ML Engineer",
    "DevOps Engineer",
  ];

  const levels = ["Junior", "Mid-Level", "Senior"];

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/interview");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, experienceLevel: selectedLevel }),
      });

      if (res.ok) {
        const session = await res.json();
        router.push(`/dashboard/interview/${session._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <div className="relative z-10 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <MessageSquare className="w-8 h-8 text-brand-500" />
          <span>AI Mock Interview</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simulate tech interviews with custom AI questions. Answer by text or simulated voice recorder and receive granular performance reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO COLUMNS: SETUP CONFIG */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-brand-500 animate-pulse" />
              <span>Configure Session</span>
            </h3>

            <form onSubmit={handleStart} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Role Target
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} className="text-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {levels.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setSelectedLevel(l)}
                        className={`py-3 rounded-2xl text-xs font-bold border transition ${
                          selectedLevel === l
                            ? "border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400"
                            : "border-slate-200/50 dark:border-slate-800/40 text-slate-500 hover:bg-slate-550/5"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/30 flex justify-end">
                <button
                  type="submit"
                  disabled={startLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-70 disabled:pointer-events-none"
                >
                  {startLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating AI Questions...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Start Interview Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: SESSION HISTORY */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-slate-400" />
            <span>Session History</span>
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-450" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-12">
              No previous interviews found. Initiate your first session on the left.
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => {
                const avgScore = sess.overallScores
                  ? Math.round(
                      (sess.overallScores.technical +
                        sess.overallScores.communication +
                        sess.overallScores.confidence) /
                        3
                    )
                  : 0;

                return (
                  <button
                    key={sess._id}
                    onClick={() => router.push(`/dashboard/interview/${sess._id}`)}
                    className="w-full text-left p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-900/10 transition flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sess.role}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Level: {sess.experienceLevel}
                      </p>
                      <span className="text-[9px] font-semibold text-slate-400 flex items-center mt-2.5">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {new Date(sess.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      {sess.status === "completed" ? (
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                          avgScore >= 80
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
                            : avgScore >= 60
                            ? "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-450"
                        }`}>
                          <Award className="w-3.5 h-3.5 mr-0.5" />
                          <span>{avgScore}%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-500 flex items-center">
                          <span>Resume</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
