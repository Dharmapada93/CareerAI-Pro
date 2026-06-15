import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ClipboardList,
  MessageSquare,
  Check,
  Loader2,
  Calendar,
  UserCheck,
  Search,
  Activity,
  AlertCircle
} from "lucide-react";
import { AdminCharts } from "./AdminCharts";
import { apiFetch } from "../../services/api";
import confetti from "canvas-confetti";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  subscription: "Free" | "Pro" | "Enterprise";
  createdAt: string;
}

interface FeedbackItem {
  _id: string;
  email: string;
  message: string;
  type: string;
  createdAt: string;
}

interface LogItem {
  _id: string;
  action: string;
  details: string;
  createdAt: string;
  userId?: {
    name: string;
    email: string;
  } | null;
}

interface AdminDashboardClientProps {
  initialUsers: UserItem[];
  initialFeedback: FeedbackItem[];
  initialLogs: LogItem[];
  counts: {
    users: number;
    resumes: number;
    interviews: number;
    atsReports: number;
    coverLetters: number;
  };
  subscriptions: {
    Free: number;
    Pro: number;
    Enterprise: number;
  };
}

export function AdminDashboardClient({
  initialUsers,
  initialFeedback,
  initialLogs,
  counts,
  subscriptions
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "logs" | "feedback">("analytics");

  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialFeedback);
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [subUpdatingId, setSubUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const handleUpdateSubscription = async (userId: string, newTier: "Free" | "Pro" | "Enterprise") => {
    setActionError("");
    setActionSuccess("");
    setSubUpdatingId(userId);

    try {
      await apiFetch("/admin/subscription", {
        method: "PUT",
        body: { userId, subscription: newTier }
      });

      // Update local state
      setUsers(users.map((u) => (u._id === userId ? { ...u, subscription: newTier } : u)));
      setActionSuccess(`Tier updated successfully to ${newTier}!`);
      
      // Visual Confetti feedback for premium upgrades
      if (newTier === "Pro" || newTier === "Enterprise") {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to update subscription tier.");
    } finally {
      setSubUpdatingId(null);
    }
  };

  const handleResolveFeedback = async (feedbackId: string) => {
    setActionError("");
    setActionSuccess("");
    try {
      await apiFetch(`/feedback/${feedbackId}`, {
        method: "DELETE"
      });

      setFeedback(feedback.filter((f) => f._id !== feedbackId));
      setActionSuccess("Support feedback resolved and archived.");
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to resolve support report.");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.subscription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Messages */}
      {actionError && (
        <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center space-x-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-2xl text-xs">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
        {[
          { id: "analytics", name: "Analytics Charts", icon: Activity },
          { id: "users", name: "User Tiers Management", icon: Users },
          { id: "logs", name: "Audit & Security Logs", icon: ClipboardList },
          { id: "feedback", name: "Support Tickets inbox", icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setActionError("");
                setActionSuccess("");
              }}
              className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800/45 dark:text-slate-350 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <AdminCharts
                counts={counts}
                subscriptions={subscriptions}
              />
            </motion.div>
          )}

          {/* TAB: USERS LIST */}
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Search user bar */}
              <div className="flex items-center space-x-2 max-w-sm bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter users by name or tier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white w-full"
                />
              </div>

              {/* Table of user registration lists */}
              <div className="glass-panel rounded-3xl overflow-hidden bg-white/70 dark:bg-dark-350/70">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/40">
                        <th className="p-4 font-semibold">User Details</th>
                        <th className="p-4 font-semibold">Contact Email</th>
                        <th className="p-4 font-semibold">Active Plan Tier</th>
                        <th className="p-4 font-semibold">Joined Date</th>
                        <th className="p-4 font-semibold text-right">Adjust subscription</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {filteredUsers.map((usr) => (
                        <tr key={usr._id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-500/[0.01]">
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-extrabold uppercase text-xs">
                              {usr.name ? usr.name.slice(0, 2) : "US"}
                            </div>
                            <span>{usr.name || "Anonymous User"}</span>
                          </td>
                          <td className="p-4">{usr.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                              usr.subscription === "Free"
                                ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                : usr.subscription === "Pro"
                                ? "bg-brand-500/15 text-brand-650 dark:text-brand-400"
                                : "bg-indigo-500/15 text-indigo-650 dark:text-indigo-400"
                            }`}>
                              {usr.subscription}
                            </span>
                          </td>
                          <td className="p-4">{new Date(usr.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center space-x-1.5">
                              {subUpdatingId === usr._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                              ) : (
                                <select
                                  value={usr.subscription}
                                  onChange={(e) => handleUpdateSubscription(usr._id, e.target.value as any)}
                                  className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200"
                                >
                                  <option value="Free">Free Tier</option>
                                  <option value="Pro">Pro Tier</option>
                                  <option value="Enterprise">Enterprise</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">No registrations match filter.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: AUDIT LOGS */}
          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-dark-350/70">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-brand-500" />
                  <span>Telemetry Audit Logs</span>
                </h3>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {logs.map((log) => (
                    <div key={log._id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-805 flex justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[9px]">
                            {log.action}
                          </span>
                          {log.userId && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              by {log.userId.name} ({log.userId.email})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          {log.details}
                        </p>
                      </div>

                      <div className="text-[9px] text-slate-400 font-bold whitespace-nowrap self-start">
                        {new Date(log.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-xs text-slate-400 py-12 text-center">No active security logs found.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: FEEDBACK & SUPPORT */}
          {activeTab === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <AnimatePresence>
                {feedback.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 text-left relative bg-white/70 dark:bg-dark-350/70"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.type === "bug"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}>
                          {item.type || "feedback"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-450 flex items-center">
                          <Calendar className="w-3 h-3 mr-0.5" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed pr-2 italic">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                      <span className="truncate max-w-[65%]">{item.email}</span>
                      <button
                        onClick={() => handleResolveFeedback(item._id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] flex items-center space-x-1 transition shadow-sm shadow-emerald-500/10"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Archive</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {feedback.length === 0 && (
                <div className="md:col-span-2 glass-panel p-12 text-center rounded-3xl text-slate-400 py-24 space-y-2 bg-white/70 dark:bg-dark-350/70">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">Zero support feedback or bug tickets outstanding.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
