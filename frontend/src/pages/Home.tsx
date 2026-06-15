import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import {
  FileText,
  Scan,
  MessageSquare,
  Mail,
  FolderKanban,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ThreeDHeroCanvas from "../components/3d/ThreeDHeroCanvas";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const coreFeatures = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      desc: "Compile professional, recruiter-approved resumes. Generate high-impact summaries and bullets using STAR methodology.",
      color: "from-brand-500 to-indigo-500",
    },
    {
      icon: Scan,
      title: "ATS Score Checker",
      desc: "Grade your resumes matching any target job description. Reveal missing keywords, formatting suggestions, and skill gap roadmaps.",
      color: "from-indigo-500 to-indigo-700",
    },
    {
      icon: MessageSquare,
      title: "AI Mock Interviews",
      desc: "Simulate live technical and behavioral interviews. Get graded performance reports highlighting Tech depth, Comm, and Confidence.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Mail,
      title: "Cover Letter Generator",
      desc: "Draft personalized, structured cover letters in seconds. Simply enter company context and customize in-place.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FolderKanban,
      title: "Portfolio Generator",
      desc: "Instantly expose a responsive public portfolio website pulling data directly from your resume databases.",
      color: "from-sky-500 to-sky-600",
    },
  ];

  const templatesList = [
    { name: "Modern", desc: "Bold headers and structured timeline columns.", popular: true },
    { name: "Minimalist", desc: "Timeless black and white Recruiter formatting." },
    { name: "Professional", desc: "A clean standard layout featuring highlighted section headers." },
  ];

  const faqs = [
    {
      q: "How does the AI Resume Builder star-optimize my bullet points?",
      a: "Our system calls a dedicated Python FastAPI service that parses your raw experience description and rewrites it into three STAR (Situation, Task, Action, Result) alternatives, including active verbs and impact metrics.",
    },
    {
      q: "Does CareerAI Pro store my data locally?",
      a: "Yes! We run on a local MongoDB community server database, ensuring complete privacy and speed. There are no remote database cloud sync configurations required.",
    },
    {
      q: "Can I export my resume as a PDF file?",
      a: "Absolutely. We provide a custom print stylesheet. Clicking 'Export PDF' opens the standard browser print window with sidebars, navbars, and editor controls automatically hidden to deliver a pixel-perfect standard page layout.",
    },
    {
      q: "Is there a real-time voice grading simulator?",
      a: "Yes. Inside our AI Mock Interview room, you can click 'Speak Answer' to simulate speaking your technical explanation, which then transcribes and submits to the evaluator for technical depth grading.",
    },
  ];

  return (
    <div className="relative z-10 flex flex-col items-center">
      {/* SECTION 1: HERO */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center px-4 max-w-5xl text-center space-y-8 relative overflow-hidden py-16 w-full">
        <ThreeDHeroCanvas />
        {/* Glow filters */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            <span>Next-Gen Career SaaS for Freshers</span>
          </span>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-800 dark:text-white max-w-4xl mx-auto">
            Accelerate Your Job Hunt with{" "}
            <span className="bg-gradient-to-r from-brand-500 via-indigo-550 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
              CareerAI Pro
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-450 max-w-2xl mx-auto leading-relaxed">
            Create recruiter-approved resumes, scan ATS compatibility scores, practice technical questions in our AI mock interview room, and host public portfolios.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md animate-float"
        >
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 active:scale-98 transition"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 active:scale-98 transition"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition"
              >
                View Pricing
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* SECTION 2: PROBLEMS CARD */}
      <section className="w-full max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-10">
          Why Job Seekers Fail Recruiter Screening
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl text-left space-y-3">
            <h4 className="font-bold text-red-500 text-base">Unmatched JD Keywords</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Applicant Tracking Systems immediately auto-reject resumes missing critical keywords and target technologies.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-3xl text-left space-y-3">
            <h4 className="font-bold text-red-500 text-base">Vague Bullet Points</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Listing generic responsibilities rather than STAR methodology metric accomplishments lacks recruiter appeal.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-3xl text-left space-y-3">
            <h4 className="font-bold text-red-500 text-base">Lack of Interview Preparation</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Even with a perfect resume, candidates frequently stumble on unexpected live technical explanations.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES GRID */}
      <section id="features" className="w-full max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
          End-to-End Career Engines
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-12">
          Gated Pro tools powered by our local Python FastAPI microservice.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-6 rounded-3xl text-left space-y-4 hover:shadow-glass-md transition duration-300 relative overflow-hidden group"
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${feat.color} text-white w-fit shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-brand-500 transition">
                  {feat.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: TEMPLATES SHOWCASE */}
      <section className="w-full max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
          Recruiter-Approved Resume Templates
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-12">
          Instantly switch between design structures to match company culture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templatesList.map((tpl, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl flex flex-col justify-between text-left space-y-4 hover:shadow-glass-md transition"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">{tpl.name}</h4>
                  {tpl.popular && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{tpl.desc}</p>
              </div>

              <div className="h-44 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center justify-center text-slate-400 text-xs select-none">
                {tpl.name} Preview Layout
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: FAQs */}
      <section className="w-full max-w-4xl px-6 py-16 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-805 dark:text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/30"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180" : ""}`}
                />
              </button>
              {activeFaq === idx && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800/30 bg-slate-50/30 dark:bg-slate-900/10 text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: CTA CALL */}
      <section className="w-full max-w-5xl px-6 py-12 text-center mb-16">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden space-y-6">
          {/* Background circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl font-extrabold text-slate-805 dark:text-white max-w-lg mx-auto">
            Ready to Stand Out in the Recruiting Pipeline?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Unlock AI-powered suggestions, STAR-accomplishment grids, ATS score checker gauges, and mock technical preparation.
          </p>

          <div className="pt-4 flex justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/10 active:scale-98 transition"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-500/10 active:scale-98 transition"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
