import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { apiFetch } from "../services/api";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Award,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react";

interface ProfileStats {
  resumeCount: number;
  interviewCount: number;
  highestAts: number;
}

export default function Profile() {
  const { user, login, token } = useAuthStore();
  const [name, setName] = useState("");
  const [stats, setStats] = useState<ProfileStats>({
    resumeCount: 0,
    interviewCount: 0,
    highestAts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const data = await apiFetch("/profile");
      setName(data.user.name);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      const updatedUser = await apiFetch("/profile", {
        method: "PUT",
        body: { name },
      });

      setSuccess("Profile settings updated successfully!");
      if (token && user) {
        // Sync local storage / zustand store user parameters
        login(token, {
          ...user,
          name: updatedUser.name,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[75vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-605" />
      </div>
    );
  }

  return (
    <div className="relative z-10 pb-16 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <UserIcon className="w-8 h-8 text-brand-500" />
          <span>My Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and view your overall career advancement logs.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Resumes */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              Resumes Created
            </p>
            <h3 className="text-2xl font-bold text-slate-850 dark:text-white">
              {stats.resumeCount}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* ATS Score */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              Highest ATS Match
            </p>
            <h3 className="text-2xl font-bold text-slate-855 dark:text-white">
              {stats.highestAts > 0 ? `${stats.highestAts}%` : "N/A"}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Interviews */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between bg-white/70 dark:bg-dark-350/70">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              AI Mock Interviews
            </p>
            <h3 className="text-2xl font-bold text-slate-850 dark:text-white">
              {stats.interviewCount}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: EDIT FORM */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-dark-350/70">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-brand-500 animate-pulse" />
            <span>Account Details</span>
          </h3>

          {error && (
            <div className="mb-4 flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Email Address (Not Editable)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-450 dark:text-slate-500 bg-slate-105 dark:bg-slate-900/30 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveLoading || !name.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-75"
              >
                {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: SUBSCRIPTION DETAILS CARD */}
        <div className="glass-panel p-6 rounded-3xl text-left space-y-4 bg-white/70 dark:bg-dark-350/70">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center">
            <Award className="w-4.5 h-4.5 mr-2 text-slate-400" />
            <span>My Plan</span>
          </h3>

          <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/10 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Tier</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {user?.subscription || "Free"}
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {user?.subscription === "Free"
                ? "You are on the Free trial tier. Upgrade to unlock unlimited AI resumes, ATS scanners, and practice mock rooms."
                : user?.subscription === "Pro"
                ? "You have Pro Access. Enjoy unlimited builders, AI STAR refinement tools, and portfolios."
                : "You have Enterprise Access. Enjoy priority advisors reviews and fully customized parameters."}
            </p>

            <Link
              to="/pricing"
              className="block text-center w-full py-2.5 px-4 rounded-xl bg-slate-905 dark:bg-slate-800 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
