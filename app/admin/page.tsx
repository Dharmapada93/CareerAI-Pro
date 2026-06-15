import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import ATSReport from "@/models/ATSReport";
import InterviewSession from "@/models/InterviewSession";
import CoverLetter from "@/models/CoverLetter";
import ActivityLog from "@/models/ActivityLog";
import Feedback from "@/models/Feedback";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Guard: Admin role verification
  if (!session || (session.user as any).role !== "admin") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You do not possess the required administrator authorizations to view this panel.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  await connectToDatabase();

  // 1. Fetch metrics
  const userCount = await User.countDocuments();
  const resumeCount = await Resume.countDocuments();
  const interviewCount = await InterviewSession.countDocuments();
  const atsCount = await ATSReport.countDocuments();
  const letterCount = await CoverLetter.countDocuments();

  const freeCount = await User.countDocuments({ subscription: "Free" });
  const proCount = await User.countDocuments({ subscription: "Pro" });
  const enterpriseCount = await User.countDocuments({ subscription: "Enterprise" });

  // 2. Fetch lists
  const users = await User.find()
    .select("name email subscription createdAt")
    .sort({ createdAt: -1 });

  const feedback = await Feedback.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  const logs = await ActivityLog.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(50);

  // 3. Serialize MongoDB documents cleanly for Client Component
  const serializedUsers = users.map((u) => ({
    _id: u._id.toString(),
    name: u.name || "Anonymous User",
    email: u.email,
    subscription: u.subscription || "Free",
    createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
  }));

  const serializedFeedback = feedback.map((f) => ({
    _id: f._id.toString(),
    email: f.userId && (f.userId as any).email ? (f.userId as any).email : "anonymous@example.com",
    message: f.message,
    type: f.type || "feedback",
    createdAt: f.createdAt ? f.createdAt.toISOString() : new Date().toISOString(),
  }));

  const serializedLogs = logs.map((l) => ({
    _id: l._id.toString(),
    action: l.action,
    details: l.details,
    createdAt: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
    userId: l.userId ? {
      name: (l.userId as any).name || "Anonymous",
      email: (l.userId as any).email || "",
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
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            Overview statistics of user signups, document versions, system activities, and client feedback.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-4 sm:mt-0 px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>User Panel</span>
        </Link>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Registrations
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {userCount}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Resumes */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              Resumes Created
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {resumeCount}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Mock Interviews */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Interviews Practiced
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {interviewCount}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-650 dark:text-emerald-450">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* ATS score checker count */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              ATS Reports Ran
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {atsCount}
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
        counts={{ users: userCount, resumes: resumeCount, interviews: interviewCount, atsReports: atsCount, coverLetters: letterCount }}
        subscriptions={{ Free: freeCount, Pro: proCount, Enterprise: enterpriseCount }}
      />
    </div>
  );
}
