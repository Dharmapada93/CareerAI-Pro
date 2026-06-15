"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface ChartsProps {
  atsHistory: Array<{ date: string; score: number }>;
  interviewMetrics: {
    technical: number;
    communication: number;
    confidence: number;
  };
}

export function DashboardCharts({ atsHistory, interviewMetrics }: ChartsProps) {
  // Fallback data if user has no history
  const atsChartData =
    atsHistory.length > 0
      ? atsHistory
      : [
          { date: "N/A 1", score: 60 },
          { date: "N/A 2", score: 72 },
          { date: "N/A 3", score: 65 },
          { date: "N/A 4", score: 78 },
        ];

  const radarData = [
    { subject: "Technical Depth", value: interviewMetrics.technical || 65, fullMark: 100 },
    { subject: "Communication", value: interviewMetrics.communication || 70, fullMark: 100 },
    { subject: "Confidence Level", value: interviewMetrics.confidence || 75, fullMark: 100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* ATS Score Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">ATS Optimization History</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Track your score improvements over time</p>
          </div>
          {atsHistory.length === 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500">
              Demo Data
            </span>
          )}
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={atsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="atsGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139, 92, 246, 0.05)" />
              <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.4)" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="rgba(148, 163, 184, 0.4)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(139, 92, 246, 0.2)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#atsGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* AI Mock Interview Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Mock Interview Summary</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Your average skills evaluation breakdown</p>
          </div>
          {!interviewMetrics.technical && !interviewMetrics.communication && !interviewMetrics.confidence && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500">
              Demo Data
            </span>
          )}
        </div>
        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(139, 92, 246, 0.08)" />
              <PolarAngleAxis dataKey="subject" stroke="rgba(148, 163, 184, 0.7)" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(148, 163, 184, 0.3)" fontSize={10} />
              <Radar
                name="Career Score"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(99, 102, 241, 0.2)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
