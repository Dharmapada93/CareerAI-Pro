import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Map,
  BookOpen,
  DollarSign,
  Mail,
  Copy,
  Check,
  Loader2,
  Plus,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "../services/api";

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface Milestone {
  step: number;
  title: string;
  duration: string;
  details: string;
}

interface LearningPlan {
  planTitle: string;
  modules: Array<{
    title: string;
    duration: string;
    topics: string[];
    resources: string[];
  }>;
}

interface Roadmap {
  role: string;
  milestones: Milestone[];
  recommendedSkills: string[];
}

interface Negotiation {
  strategy: string;
  talkingPoints: string[];
  scripts: Array<{
    scenario: string;
    dialogue: string;
  }>;
}

export default function CareerCoach() {
  const [activeTab, setActiveTab] = useState<"roadmap" | "learning" | "linkedin" | "negotiation" | "outreach">("roadmap");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Roadmap Form Inputs & Results
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [roadmapResult, setRoadmapResult] = useState<Roadmap | null>(null);

  // Learning Plan Inputs & Results
  const [skillGapInput, setSkillGapInput] = useState<string[]>([]);
  const [gapInput, setGapInput] = useState("");
  const [learningPlanResult, setLearningPlanResult] = useState<LearningPlan | null>(null);

  // LinkedIn Bio Inputs & Results
  const [linkedinRole, setLinkedinRole] = useState("");
  const [linkedinSkills, setLinkedinSkills] = useState<string[]>([]);
  const [lSkillInput, setLSkillInput] = useState("");
  const [linkedinResult, setLinkedinResult] = useState<string[]>([]);

  // Salary Negotiator Inputs & Results
  const [negRole, setNegRole] = useState("");
  const [negOffer, setNegOffer] = useState("");
  const [negResult, setNegResult] = useState<Negotiation | null>(null);

  // Outreach Email Inputs & Results
  const [outreachCompany, setOutreachCompany] = useState("");
  const [outreachRole, setOutreachRole] = useState("");
  const [outreachContext, setOutreachContext] = useState("");
  const [outreachResult, setOutreachResult] = useState("");

  const triggerCopy = (text: string, indexId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch("/career-coach", {
        method: "POST",
        body: {
          type: "roadmap",
          payload: { role: targetRole, skills: currentSkills }
        }
      });
      setRoadmapResult(data);
    } catch (err) {
      console.error("Failed to generate roadmap", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLearningPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skillGapInput.length === 0) return;
    setLoading(true);
    try {
      const data = await apiFetch("/career-coach", {
        method: "POST",
        body: {
          type: "learning-plan",
          payload: { skillGap: skillGapInput }
        }
      });
      setLearningPlanResult(data);
    } catch (err) {
      console.error("Failed to generate learning plan", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLinkedIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinRole.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch("/career-coach", {
        method: "POST",
        body: {
          type: "linkedin-bio",
          payload: { role: linkedinRole, keySkills: linkedinSkills }
        }
      });
      setLinkedinResult(data.bios || []);
    } catch (err) {
      console.error("Failed to generate LinkedIn bios", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negRole.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch("/career-coach", {
        method: "POST",
        body: {
          type: "negotiation",
          payload: { role: negRole, offerDetails: negOffer }
        }
      });
      setNegResult(data);
    } catch (err) {
      console.error("Failed to generate negotiation script", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachCompany.trim() || !outreachRole.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch("/career-coach", {
        method: "POST",
        body: {
          type: "outreach",
          payload: { company: outreachCompany, role: outreachRole, context: outreachContext }
        }
      });
      setOutreachResult(data.email || "");
    } catch (err) {
      console.error("Failed to generate outreach email", err);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (val: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, clearer: () => void) => {
    if (!val.trim() || list.includes(val.trim())) return;
    setter([...list, val.trim()]);
    clearer();
  };

  const removeSkill = (idx: number, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updated = [...list];
    updated.splice(idx, 1);
    setter(updated);
  };

  return (
    <div className="relative z-10 pb-16 text-slate-800 dark:text-slate-100 max-w-6xl mx-auto px-4">
      {/* Header Banner */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400 flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
          <span>AI Career Coach</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Unlock personalized strategies, target role roadmaps, customized learning syllabi, and professional messaging.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
        {[
          { id: "roadmap", name: "Career Roadmap", icon: Map },
          { id: "learning", name: "Learning Curriculums", icon: BookOpen },
          { id: "linkedin", name: "LinkedIn headline & Bio", icon: Linkedin },
          { id: "negotiation", name: "Salary Negotiator", icon: DollarSign },
          { id: "outreach", name: "Outreach Emails", icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCopiedIndex(null);
              }}
              className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-655 dark:bg-slate-800/45 dark:text-slate-350 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROL INPUTS */}
        <div className="lg:col-span-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-850 p-6 rounded-3xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {activeTab === "roadmap" && (
              <motion.form
                key="roadmap-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleGenerateRoadmap}
                className="space-y-4 text-left"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Roadmap Config</h3>
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5">Target Career Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Architect"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5 font-sans">Current Tech Stack</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="React, CSS"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(skillInput, currentSkills, setCurrentSkills, () => setSkillInput(""));
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(skillInput, currentSkills, setCurrentSkills, () => setSkillInput(""))}
                      className="px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {currentSkills.map((sk, i) => (
                      <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-brand-500/10 text-brand-700 dark:text-brand-405 text-[10px] font-bold">
                        <span>{sk}</span>
                        <button type="button" onClick={() => removeSkill(i, currentSkills, setCurrentSkills)} className="text-brand-500"><Plus className="w-2.5 h-2.5 rotate-45" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !targetRole.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />}
                  <span>Generate Roadmap</span>
                </button>
              </motion.form>
            )}

            {activeTab === "learning" && (
              <motion.form
                key="learning-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleGenerateLearningPlan}
                className="space-y-4 text-left"
              >
                <h3 className="text-sm font-bold text-slate-905 dark:text-white uppercase tracking-wider mb-2">Learning Plan Config</h3>
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-555 uppercase mb-1.5">Missing Technologies / Gaps</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Docker, Kubernetes"
                      value={gapInput}
                      onChange={(e) => setGapInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(gapInput, skillGapInput, setSkillGapInput, () => setGapInput(""));
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(gapInput, skillGapInput, setSkillGapInput, () => setGapInput(""))}
                      className="px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {skillGapInput.map((gap, i) => (
                      <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                        <span>{gap}</span>
                        <button type="button" onClick={() => removeSkill(i, skillGapInput, setSkillGapInput)} className="text-purple-500"><Plus className="w-2.5 h-2.5 rotate-45" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || skillGapInput.length === 0}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />}
                  <span>Generate Curriculum</span>
                </button>
              </motion.form>
            )}

            {activeTab === "linkedin" && (
              <motion.form
                key="linkedin-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleGenerateLinkedIn}
                className="space-y-4 text-left"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">LinkedIn Writer</h3>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase mb-1.5">Target Job Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devops Engineer"
                    value={linkedinRole}
                    onChange={(e) => setLinkedinRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-505 uppercase mb-1.5">Core Competencies</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. AWS, CI/CD"
                      value={lSkillInput}
                      onChange={(e) => setLSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(lSkillInput, linkedinSkills, setLinkedinSkills, () => setLSkillInput(""));
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(lSkillInput, linkedinSkills, setLinkedinSkills, () => setLSkillInput(""))}
                      className="px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {linkedinSkills.map((sk, i) => (
                      <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                        <span>{sk}</span>
                        <button type="button" onClick={() => removeSkill(i, linkedinSkills, setLinkedinSkills)} className="text-blue-500"><Plus className="w-2.5 h-2.5 rotate-45" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !linkedinRole.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500" />}
                  <span>Generate Bios</span>
                </button>
              </motion.form>
            )}

            {activeTab === "negotiation" && (
              <motion.form
                key="negotiation-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleGenerateNegotiation}
                className="space-y-4 text-left"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Negotiator</h3>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase mb-1.5">Job Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Product Designer"
                    value={negRole}
                    onChange={(e) => setNegRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase mb-1.5">Offer Details</label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Base salary of $110,000, 3 weeks PTO, standard medical benefits."
                    value={negOffer}
                    onChange={(e) => setNegOffer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !negRole.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500" />}
                  <span>Generate Script</span>
                </button>
              </motion.form>
            )}

            {activeTab === "outreach" && (
              <motion.form
                key="outreach-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleGenerateOutreach}
                className="space-y-4 text-left"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Recruiter Outreach</h3>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase mb-1.5">Target Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google"
                    value={outreachCompany}
                    onChange={(e) => setOutreachCompany(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase mb-1.5">Target Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Engineer"
                    value={outreachRole}
                    onChange={(e) => setOutreachRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase mb-1.5">Additional Context / Details</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. I worked on a similar microservice stack for 2 years and have a mutual contact..."
                    value={outreachContext}
                    onChange={(e) => setOutreachContext(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/45 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !outreachCompany.trim() || !outreachRole.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 hover:scale-[1.01] active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500" />}
                  <span>Generate Outreach</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: RENDERED COOPERATIVE RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-3xl"
              >
                <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Consulting Career Intelligence...</h4>
                  <p className="text-xs text-slate-400">Synthesizing targeted suggestions using specialized models</p>
                </div>
              </motion.div>
            )}

            {!loading && activeTab === "roadmap" && (
              <motion.div
                key="roadmap-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {roadmapResult ? (
                  <div className="space-y-6">
                    {/* Recommended skills tag list */}
                    {roadmapResult.recommendedSkills && roadmapResult.recommendedSkills.length > 0 && (
                      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/75 dark:bg-dark-350/75">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Identified Skill Gaps</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Study these missing tech stacks to improve hiring odds:</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {roadmapResult.recommendedSkills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 text-[10px] font-bold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline roadmap */}
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-white/75 dark:bg-dark-350/75">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center mb-6">
                        <Map className="w-5 h-5 mr-2 text-brand-500" />
                        <span>Timeline Milestones: {roadmapResult.role}</span>
                      </h3>

                      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-4">
                        {roadmapResult.milestones.map((milestone, idx) => (
                          <div key={idx} className="relative pl-8 group">
                            {/* Circle Node indicator */}
                            <span className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-slate-900 border-4 border-white dark:border-slate-900 text-white flex items-center justify-center text-[10px] font-bold group-hover:bg-brand-500 transition-colors shadow">
                              {milestone.step}
                            </span>

                            <div className="space-y-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h4 className="text-sm font-bold text-slate-805 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                  {milestone.title}
                                </h4>
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-500 dark:text-slate-400 self-start sm:self-auto">
                                  {milestone.duration}
                                </span>
                              </div>
                              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed pt-0.5">
                                {milestone.details}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 space-y-3 bg-white/75 dark:bg-dark-350/75">
                    <Map className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-700" />
                    <p className="text-xs">Provide a target role config on the left panel to compile your interactive transition roadmap.</p>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && activeTab === "learning" && (
              <motion.div
                key="learning-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {learningPlanResult ? (
                  <div className="space-y-6">
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/75 dark:bg-dark-350/75">
                      <h3 className="text-lg font-bold text-slate-905 dark:text-white flex items-center mb-6">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
                        <span>Curriculum: {learningPlanResult.planTitle}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {learningPlanResult.modules.map((mod, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-snug tracking-wide max-w-[70%] text-left">
                                {mod.title}
                              </h4>
                              <span className="text-[9px] font-bold bg-purple-500/10 text-purple-705 dark:text-purple-305 px-2 py-0.5 rounded">
                                {mod.duration}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-slate-400 uppercase text-left">Core Topics</p>
                              <ul className="list-disc pl-4 text-xs text-slate-500 dark:text-slate-405 space-y-0.5 text-left">
                                {mod.topics.map((topic, i) => (
                                  <li key={i}>{topic}</li>
                                ))}
                              </ul>
                            </div>

                            {mod.resources && mod.resources.length > 0 && (
                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40 space-y-1 text-left">
                               <p className="text-[9px] font-bold text-slate-400 uppercase">Study Materials</p>
                                <div className="flex flex-wrap gap-1">
                                  {mod.resources.map((res, i) => (
                                    <span key={i} className="text-[9px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/5 px-2 py-0.5 rounded">
                                      {res}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 space-y-3 bg-white/75 dark:bg-dark-350/75">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-700" />
                    <p className="text-xs">Compile gaps/missing tech stacks to compose a targeted modules learning syllabus.</p>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && activeTab === "linkedin" && (
              <motion.div
                key="linkedin-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-left"
              >
                {linkedinResult.length > 0 ? (
                  <div className="space-y-4">
                    {linkedinResult.map((bio, idx) => (
                      <div key={idx} className="glass-panel p-5 rounded-2xl flex justify-between items-start gap-4 bg-white/75 dark:bg-dark-350/75 text-left">
                        <div className="space-y-1.5 flex-grow">
                          <span className="text-[9px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                            BIO VARIANT {idx + 1}
                          </span>
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 pr-2">
                            {bio}
                          </p>
                        </div>

                        <button
                          onClick={() => triggerCopy(bio, `bio-${idx}`)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 transition flex-shrink-0"
                          title="Copy to Clipboard"
                        >
                          {copiedIndex === `bio-${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 space-y-3 bg-white/75 dark:bg-dark-350/75">
                    <Linkedin className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-700" />
                    <p className="text-xs">Insert target roles and details to craft 3 premium headlines for your LinkedIn summary.</p>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && activeTab === "negotiation" && (
              <motion.div
                key="negotiation-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {negResult ? (
                  <div className="space-y-6">
                    {/* Strategy summary */}
                    <div className="glass-panel p-5 rounded-2xl bg-amber-500/[0.02] border-amber-500/10 border space-y-2 text-left bg-white/75 dark:bg-dark-350/75">
                      <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Strategic Recommendation</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {negResult.strategy}
                      </p>
                    </div>

                    {/* Expandable Dialogues */}
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 text-left bg-white/75 dark:bg-dark-350/75">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450">Key Talking Points</h4>
                        <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                          {negResult.talkingPoints.map((tp, idx) => (
                            <li key={idx}>{tp}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-3">Dialogue Scripts</h4>
                        {negResult.scripts.map((script, idx) => (
                          <div key={idx} className="p-4.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/30 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Scenario: {script.scenario}
                              </span>
                              <button
                                onClick={() => triggerCopy(script.dialogue, `script-${idx}`)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-505 transition"
                                title="Copy dialogue"
                              >
                                {copiedIndex === `script-${idx}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 italic">
                              &ldquo;{script.dialogue}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 space-y-3 bg-white/75 dark:bg-dark-350/75">
                    <DollarSign className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-700" />
                    <p className="text-xs">Compile details of offer sheets to formulate negotiation tactics and dialogue builders.</p>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && activeTab === "outreach" && (
              <motion.div
                key="outreach-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-left"
              >
                {outreachResult ? (
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 relative bg-white/75 dark:bg-dark-350/75 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded">
                        OUTREACH EMAIL DRAFT
                      </span>
                      <button
                        onClick={() => triggerCopy(outreachResult, "outreach")}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-105 dark:hover:bg-slate-800/55 text-slate-500 flex items-center space-x-1.5 transition text-xs font-bold"
                      >
                        {copiedIndex === "outreach" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Email</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-205/40 dark:border-slate-800/30">
                      <pre className="text-xs text-slate-700 dark:text-slate-250 leading-relaxed font-sans whitespace-pre-wrap">
                        {outreachResult}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 space-y-3 bg-white/75 dark:bg-dark-350/75">
                    <Mail className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-700" />
                    <p className="text-xs">Paste target role and target company parameters to write recruiter inquiry templates.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
