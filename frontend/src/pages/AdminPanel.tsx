import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";
import { AdminDashboardClient } from "../components/admin/AdminDashboardClient";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminPanel() {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiFetch("/admin/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-650" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading administrator console telemetry...</p>
      </div>
    );
  }

  if (error || !statsData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full space-y-4 bg-white/70 dark:bg-dark-350/70">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied / Error</h2>
          <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
            {error instanceof Error ? error.message : "You do not possess the required administrator authorizations to view this panel."}
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normalize lists
  const serializedUsers = (statsData.users || []).map((u: any) => ({
    _id: u._id,
    name: u.name || "Anonymous User",
    email: u.email,
    subscription: u.subscription || "Free",
    createdAt: u.createdAt,
  }));

  const serializedFeedback = (statsData.feedback || []).map((f: any) => ({
    _id: f._id,
    email: f.userId && f.userId.email ? f.userId.email : "anonymous@example.com",
    message: f.message,
    type: f.type || "feedback",
    createdAt: f.createdAt,
  }));

  const serializedLogs = (statsData.logs || []).map((l: any) => ({
    _id: l._id,
    action: l.action,
    details: l.details,
    createdAt: l.createdAt,
    userId: l.userId ? {
      name: l.userId.name || "Anonymous",
      email: l.userId.email || "",
    } : null,
  }));

  return (
    <div className="relative z-10 pb-16 max-w-7xl mx-auto px-4 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
            <Shield className="w-8 h-8 text-brand-650" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview statistics of user signups, document versions, system activities, and client feedback.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="mt-4 sm:mt-0 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>User Panel</span>
        </Link>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Registrations
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {statsData.counts?.users || 0}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Resumes */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Resumes Created
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {statsData.counts?.resumes || 0}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Mock Interviews */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Interviews Practiced
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {statsData.counts?.interviews || 0}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-650 dark:text-emerald-450">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* ATS score checker count */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              ATS Reports Ran
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {statsData.counts?.atsReports || 0}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-650 dark:text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main client interactive control components */}
      <AdminDashboardClient
        initialUsers={serializedUsers}
        initialFeedback={serializedFeedback}
        initialLogs={serializedLogs}
        counts={statsData.counts}
        subscriptions={statsData.subscriptions}
      />
    </div>
  );
}
