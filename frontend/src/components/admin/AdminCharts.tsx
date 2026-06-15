import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface AdminChartsProps {
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

export function AdminCharts({ counts, subscriptions }: AdminChartsProps) {
  // Bar Chart Data
  const activityData = [
    { name: "Resumes", count: counts.resumes },
    { name: "ATS Scans", count: counts.atsReports },
    { name: "Interviews", count: counts.interviews },
    { name: "Cover Letters", count: counts.coverLetters },
  ];

  // Pie Chart Data
  const subData = [
    { name: "Free Tier", value: subscriptions.Free },
    { name: "Pro Tier", value: subscriptions.Pro },
    { name: "Enterprise", value: subscriptions.Enterprise },
  ];

  const COLORS = ["#94a3b8", "#8b5cf6", "#6366f1"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Activities Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl bg-white/70 dark:bg-dark-350/70"
      >
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Activity Interactions</h3>
        <div className="relative h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139, 92, 246, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(139, 92, 246, 0.2)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
 
      {/* Subscriptions Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl bg-white/70 dark:bg-dark-350/70"
      >
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">User Subscription Layout</h3>
        <div className="relative h-72 w-full min-w-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={subData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {subData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(99, 102, 241, 0.2)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" fontSize={11} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
