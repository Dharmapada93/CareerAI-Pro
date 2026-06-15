import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { ThemeToggle } from "./ThemeToggle";
import { Briefcase, Menu, X, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PremiumNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 dark:border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
              CareerAI Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
            >
              Pricing
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
                  >
                    Admin
                  </Link>
                )}
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {user.subscription}
                  </span>
                  <Link to="/dashboard/profile" className="flex items-center space-x-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <UserIcon className="w-4 h-4 text-brand-500" />
                    <span className="font-semibold max-w-[100px] truncate">{user.name}</span>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition"
                >
                  Get Started
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl glass-input text-slate-700 dark:text-slate-300"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 dark:border-white/5 overflow-hidden bg-slate-50/95 dark:bg-dark-500/95"
          >
            <div className="px-4 pt-2 pb-4 space-y-3">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-500/10 dark:text-slate-300 transition"
              >
                Home
              </Link>
              <Link
                to="/#features"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-500/10 dark:text-slate-300 transition"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-500/10 dark:text-slate-300 transition"
              >
                Pricing
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 bg-brand-500/5"
                  >
                    <LayoutDashboard className="w-5 h-5 text-brand-500" />
                    <span>Dashboard Overview</span>
                  </Link>

                  {/* Dashboard Sub-links section */}
                  <div className="pl-6 pt-1 border-l-2 border-brand-500/20 space-y-2 text-left">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Tools & Services
                    </span>
                    <Link
                      to="/dashboard/resume"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      Resume Builder
                    </Link>
                    <Link
                      to="/dashboard/ats"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      ATS Score Checker
                    </Link>
                    <Link
                      to="/dashboard/interview"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      AI Mock Interview
                    </Link>
                    <Link
                      to="/dashboard/career-coach"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      AI Career Coach
                    </Link>
                    <Link
                      to="/dashboard/job-tracker"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      AI Job Tracker
                    </Link>
                    <Link
                      to="/dashboard/cover-letter"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      Cover Letter
                    </Link>
                    <Link
                      to="/dashboard/portfolio"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      Portfolio Builder
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-brand-500 transition"
                    >
                      Settings
                    </Link>
                  </div>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-xl text-base font-semibold text-purple-650 dark:text-purple-400 hover:bg-purple-500/10 transition text-left"
                    >
                      Admin Console
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-xl text-base font-medium text-red-500 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-500/10 dark:text-slate-300 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-medium shadow-md transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
