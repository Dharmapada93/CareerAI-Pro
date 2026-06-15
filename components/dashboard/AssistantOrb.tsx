"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, X, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const TIPS = [
  "Tip: Resume keywords should exactly match the target Job Description to clear ATS scanning thresholds.",
  "Tip: Answer mock interview questions using the STAR methodology: Situation, Task, Action, Result.",
  "Tip: Avoid filler words like 'um', 'ah', 'like' during voice recordings to raise your confidence scores.",
  "Tip: Personalize your LinkedIn bio using active engineering verbs and clear technology tags.",
  "Tip: Tailor your resume summary dynamically for every specific role you apply for.",
  "Tip: Track your job applications in the pipeline tracker to never miss interview deadlines.",
];

export function AssistantOrb() {
  const { reducedMotion } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <div className="fixed bottom-6 right-6 z-45 no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="absolute bottom-18 right-0 w-80 p-5 rounded-3xl glass-panel border border-brand-500/20 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-brand-650 dark:text-brand-400 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                <span>AI Career Assistant</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed min-h-12">
              {TIPS[tipIndex]}
            </p>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleNextTip}
                className="text-[10px] font-bold text-brand-650 dark:text-brand-400 flex items-center hover:underline"
              >
                <span>Next Suggestion</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Orb Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl hover:shadow-brand-500/30 hover:scale-105 active:scale-95 transition duration-300 z-10"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Glowing Rings (Disabled if reducedMotion is active) */}
        {!reducedMotion && (
          <>
            <span className="absolute inset-0 rounded-full bg-brand-500/40 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
            <span className="absolute -inset-1 rounded-full border border-brand-500/30 blur-sm animate-pulse pointer-events-none" />
          </>
        )}
      </button>
    </div>
  );
}
