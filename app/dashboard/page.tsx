import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Resume from "@/models/Resume";
import ATSReport from "@/models/ATSReport";
import InterviewSession from "@/models/InterviewSession";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";
import {
  FileText,
  Scan,
  MessageSquare,
  Award,
  ChevronRight,
  Plus,
  Compass,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  await connectToDatabase();

  // 1. Fetch metrics
  const resumeCount = await Resume.countDocuments({ userId });
  
  const atsReports = await ATSReport.find({ userId })
    .select("score createdAt")
    .sort({ createdAt: 1 })
    .limit(10);
  
  const highestAts = atsReports.length > 0 ? Math.max(...atsReports.map((r) => r.score)) : 0;

  const completedInterviews = await InterviewSession.find({ userId, status: "completed" });
  const interviewCount = completedInterviews.length;

  // Calculate interview score averages
  let avgTech = 0;
  let avgComm = 0;
  let avgConf = 0;

  if (interviewCount > 0) {
    let sumTech = 0;
    let sumComm = 0;
    let sumConf = 0;
    completedInterviews.forEach((i) => {
      sumTech += i.overallScores?.technical || 0;
      sumComm += i.overallScores?.communication || 0;
      sumConf += i.overallScores?.confidence || 0;
    });
    avgTech = Math.round(sumTech / interviewCount);
    avgComm = Math.round(sumComm / interviewCount);
    avgConf = Math.round(sumConf / interviewCount);
  }

  // Map ATS history for Chart
  const atsHistory = atsReports.map((r) => ({
    date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: r.score,
  }));

  // 2. Fetch recent resumes
  const recentResumes = await Resume.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(3);

  // 3. Compile activities list
  const activities: Array<{ id: string; type: string; title: string; subtitle: string; time: string }> = [];
  
  recentResumes.forEach((r) => {
    activities.push({
      id: r._id.toString(),
      type: "resume",
      title: `Updated resume "${r.title}"`,
      subtitle: `${r.skills.length} skills • ${r.experience.length} experiences`,
      time: new Date(r.updatedAt).toLocaleDateString(),
    });
  });

  const latestInterviews = await InterviewSession.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(2);

  latestInterviews.forEach((i) => {
    activities.push({
      id: i._id.toString(),
      type: "interview",
      title: `Practiced ${i.role} Mock Interview`,
      subtitle: i.status === "completed" ? `Scored ${Math.round(((i.overallScores?.technical || 0) + (i.overallScores?.communication || 0) + (i.overallScores?.confidence || 0)) / 3)}%` : "In Progress",
      time: new Date(i.updatedAt).toLocaleDateString(),
    });
  });

  // Sort activities by time
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="relative z-10 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Hello, {session?.user?.name || "Careerist"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build your documents, track your ATS status, and crush your interviews.
          </p>
        </div>
        <Link
          href="/dashboard/resume"
          className="mt-4 sm:mt-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-medium text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Resume</span>
        </Link>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Resumes Count Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Resumes
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {resumeCount}
            </h3>
            <p className="text-xs text-brand-500 font-medium flex items-center">
              <span>Organized templates</span>
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* ATS Score Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Highest ATS Score
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {highestAts > 0 ? `${highestAts}%` : "N/A"}
            </h3>
            <p className="text-xs text-indigo-500 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>Keyword matched</span>
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Scan className="w-6 h-6" />
          </div>
        </div>

        {/* Mock Interviews Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Interviews Completed
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {interviewCount}
            </h3>
            <p className="text-xs text-emerald-500 font-medium flex items-center">
              <span>Interactive feedback</span>
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Career Tier Status Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Subscription
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {session?.user?.subscription || "Free"}
            </h3>
            <Link href="/pricing" className="text-xs text-purple-500 hover:text-purple-400 font-medium flex items-center group">
              <span>Manage plan</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      <DashboardCharts atsHistory={atsHistory} interviewMetrics={{ technical: avgTech, communication: avgComm, confidence: avgConf }} />

      {/* Grid: Resume list & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Resumes */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Resumes</h3>
            <Link
              href="/dashboard/resume"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentResumes.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No resumes found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first AI-optimized resume in seconds.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResumes.map((r) => (
                <div
                  key={r._id.toString()}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 group-hover:text-brand-550 dark:group-hover:text-brand-400 transition">
                        {r.title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Template: <span className="capitalize">{r.templateId}</span> • Updated {new Date(r.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/resume/${r._id}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-brand-500 dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-550 dark:text-slate-400 hover:text-white dark:hover:text-white transition"
                    title="Edit Resume"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity Log */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h3>
          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-12">
              Your actions will be logged here.
            </p>
          ) : (
            <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-6">
              {activities.map((act) => (
                <div key={act.id + act.type} className="relative">
                  {/* Glowing dot */}
                  <span className="absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-dark-500 shadow-md shadow-brand-500/30" />
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {act.subtitle}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 block mt-1">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
