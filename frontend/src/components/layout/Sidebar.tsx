import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  FileText,
  Scan,
  MessageSquare,
  Mail,
  User,
  Settings,
  FolderKanban,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Shield
} from "lucide-react";
import { cn } from "../../utils/cn";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Builder", href: "/dashboard/resume", icon: FileText },
  { name: "ATS Score Checker", href: "/dashboard/ats", icon: Scan },
  { name: "AI Mock Interview", href: "/dashboard/interview", icon: MessageSquare },
  { name: "AI Career Coach", href: "/dashboard/career-coach", icon: GraduationCap },
  { name: "AI Job Tracker", href: "/dashboard/job-tracker", icon: Briefcase },
  { name: "Cover Letter", href: "/dashboard/cover-letter", icon: Mail },
  { name: "Portfolio Builder", href: "/dashboard/portfolio", icon: FolderKanban },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-64 fixed top-16 bottom-0 left-0 z-20 hidden md:block border-r border-slate-200/50 dark:border-slate-800/40 glass-panel overflow-y-auto">
      <div className="flex flex-col h-full py-6 justify-between">
        <div className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-brand-500 to-indigo-500 text-white shadow-md shadow-brand-500/10"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-brand-500 dark:hover:text-brand-400"
                )}
              >
                <Icon className={cn(
                  "w-4.5 h-4.5 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400"
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-200/40 dark:border-slate-800/40">
              <Link
                to="/admin"
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                    : "text-purple-650 dark:text-purple-400 hover:bg-purple-500/10"
                )}
              >
                <Shield className="w-4.5 h-4.5 group-hover:scale-110" />
                <span>Admin Console</span>
              </Link>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/40 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-550">
            CareerAI Pro v1.1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
