"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Download,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck,
  Check,
} from "lucide-react";

interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

interface Project {
  title: string;
  role: string;
  description: string;
  url: string;
  technologies: string[];
}

interface Certificate {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface ResumeData {
  _id: string;
  title: string;
  templateId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certificates: Certificate[];
}

export default function ResumeBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const resumeId = params.id;

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiBulletLoading, setAiBulletLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Advanced AI upgrade states
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [toneTarget, setToneTarget] = useState("summary"); // "summary" or "exp-{idx}-{bulletIdx}"
  const [selectedTone, setSelectedTone] = useState("bold");
  const [toneLoading, setToneLoading] = useState(false);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResults, setGrammarResults] = useState<any | null>(null);
  
  // Dynamic version comparison / diff details
  const [diffData, setDiffData] = useState<any | null>(null);

  // Active accordion section
  const [activeSection, setActiveSection] = useState<string>("personal");

  // AI Bullet Refinement Modal State
  const [bulletModalOpen, setBulletModalOpen] = useState(false);
  const [currentExpIndex, setCurrentExpIndex] = useState<number | null>(null);
  const [currentBulletIndex, setCurrentBulletIndex] = useState<number | null>(null);
  const [bulletOptions, setBulletOptions] = useState<string[]>([]);
  const [customBulletInput, setCustomBulletInput] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resume/${resumeId}`);
        if (res.ok) {
          const data = await res.json();
          setResumeData(data);
        } else {
          router.push("/dashboard/resume");
        }
      } catch (err) {
        console.error(err);
        router.push("/dashboard/resume");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId, router]);

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSave = async () => {
    if (!resumeData) return;
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/resume/${resumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });
      if (res.ok) {
        triggerNotification("Resume saved successfully!");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to save resume");
    } finally {
      setSaveLoading(false);
    }
  };

  // ----------------------------------------------------
  // Form input change handlers
  // ----------------------------------------------------
  const handlePersonalInfoChange = (field: string, val: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: val,
      },
    });
  };

  const handleAddField = (section: "education" | "experience" | "projects" | "certificates") => {
    if (!resumeData) return;
    const defaults = {
      education: { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" },
      experience: { company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: [""] },
      projects: { title: "", role: "", description: "", url: "", technologies: [] },
      certificates: { name: "", issuer: "", date: "", url: "" },
    };

    setResumeData({
      ...resumeData,
      [section]: [...resumeData[section], defaults[section]],
    });
  };

  const handleRemoveField = (section: "education" | "experience" | "projects" | "certificates", index: number) => {
    if (!resumeData) return;
    const items = [...resumeData[section]];
    items.splice(index, 1);
    setResumeData({
      ...resumeData,
      [section]: items,
    });
  };

  const handleFieldChange = (section: "education" | "experience" | "projects" | "certificates", index: number, field: string, value: any) => {
    if (!resumeData) return;
    const items = [...resumeData[section]] as any[];
    items[index] = {
      ...items[index],
      [field]: value,
    };
    setResumeData({
      ...resumeData,
      [section]: items,
    });
  };

  // Experience bullets helper
  const handleExperienceBulletChange = (expIndex: number, bulletIndex: number, val: string) => {
    if (!resumeData) return;
    const exp = [...resumeData.experience];
    exp[expIndex].description[bulletIndex] = val;
    setResumeData({ ...resumeData, experience: exp });
  };

  const handleAddExperienceBullet = (expIndex: number) => {
    if (!resumeData) return;
    const exp = [...resumeData.experience];
    exp[expIndex].description.push("");
    setResumeData({ ...resumeData, experience: exp });
  };

  const handleRemoveExperienceBullet = (expIndex: number, bulletIndex: number) => {
    if (!resumeData) return;
    const exp = [...resumeData.experience];
    exp[expIndex].description.splice(bulletIndex, 1);
    setResumeData({ ...resumeData, experience: exp });
  };

  // Skills tag helper
  const handleAddSkill = (skill: string) => {
    if (!resumeData || !skill.trim()) return;
    if (resumeData.skills.includes(skill.trim())) return;
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, skill.trim()],
    });
  };

  const handleRemoveSkill = (index: number) => {
    if (!resumeData) return;
    const skills = [...resumeData.skills];
    skills.splice(index, 1);
    setResumeData({ ...resumeData, skills });
  };

  // ----------------------------------------------------
  // AI Helper Functions
  // ----------------------------------------------------
  const handleGenerateSummary = async () => {
    if (!resumeData) return;
    setAiSummaryLoading(true);

    const skills = resumeData.skills;
    const experiences = resumeData.experience.map(
      (e) => `${e.position} at ${e.company} (${e.startDate} - ${e.endDate || "present"})`
    );

    try {
      const res = await fetch("/api/resume/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, experience: experiences }),
      });

      if (res.ok) {
        const data = await res.json();
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            summary: data.summary,
          },
        });
        triggerNotification("AI Summary generated!");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI summary request failed");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleOpenBulletAI = async (expIndex: number, bulletIndex: number) => {
    if (!resumeData) return;
    const currentBullet = resumeData.experience[expIndex].description[bulletIndex];
    if (!currentBullet.trim()) {
      alert("Please type a draft bullet point first before calling AI.");
      return;
    }

    setCurrentExpIndex(expIndex);
    setCurrentBulletIndex(bulletIndex);
    setCustomBulletInput(currentBullet);
    setAiBulletLoading(true);
    setBulletModalOpen(true);

    try {
      const res = await fetch("/api/resume/ai-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: resumeData.experience[expIndex].position,
          bullet_point: currentBullet,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBulletOptions(data.bullets || []);
      } else {
        setBulletOptions(["Failed to fetch options"]);
      }
    } catch (err) {
      console.error(err);
      setBulletOptions(["Service unavailable"]);
    } finally {
      setAiBulletLoading(false);
    }
  };

  const handleSelectBulletOption = (opt: string) => {
    if (!resumeData || currentExpIndex === null || currentBulletIndex === null) return;
    const exp = [...resumeData.experience];
    exp[currentExpIndex].description[currentBulletIndex] = opt;
    setResumeData({ ...resumeData, experience: exp });
    setBulletModalOpen(false);
    triggerNotification("Bullet refined!");
  };

  const handleAITailor = async () => {
    if (!resumeData || !jobDescriptionInput.trim()) {
      alert("Please enter a target Job Description first.");
      return;
    }
    setTailorLoading(true);
    try {
      const res = await fetch("/api/resume/ai-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_data: {
            skills: resumeData.skills,
            projects: resumeData.projects.map(p => ({ title: p.title, description: p.description }))
          },
          job_description: jobDescriptionInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDiffData({
          type: "tailor",
          original: {
            summary: resumeData.personalInfo.summary,
            skills: resumeData.skills,
            projects: resumeData.projects
          },
          proposed: {
            summary: data.tailoredSummary,
            skills: data.tailoredSkills,
            projects: resumeData.projects.map((p, idx) => {
              const matchedProj = data.tailoredProjects?.find((tp: any) => tp.title === p.title);
              return {
                ...p,
                description: matchedProj ? matchedProj.description : p.description
              };
            })
          }
        });
        triggerNotification("AI tailoring ready for comparison!");
      } else {
        triggerNotification("Failed to tailor resume");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI Tailoring request failed");
    } finally {
      setTailorLoading(false);
    }
  };

  const handleAITone = async () => {
    if (!resumeData) return;
    setToneLoading(true);

    let originalText = "";
    if (toneTarget === "summary") {
      originalText = resumeData.personalInfo.summary;
    } else {
      const parts = toneTarget.split("-");
      const expIdx = parseInt(parts[1]);
      const bullIdx = parseInt(parts[2]);
      originalText = resumeData.experience[expIdx].description[bullIdx];
    }

    try {
      const res = await fetch("/api/resume/ai-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, tone: selectedTone }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiffData({
          type: "tone",
          target: toneTarget,
          original: originalText,
          proposed: data.text,
        });
        triggerNotification("AI tone adjustment ready!");
      } else {
        triggerNotification("Tone adjuster failed");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI Tone request failed");
    } finally {
      setToneLoading(false);
    }
  };

  const handleAIGrammar = async (text: string, targetKey: string) => {
    setGrammarLoading(true);
    try {
      const res = await fetch("/api/resume/ai-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setGrammarResults({
          target: targetKey,
          correctedText: data.correctedText,
          errorsFound: data.errorsFound,
          suggestions: data.suggestions
        });
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Grammar audit request failed");
    } finally {
      setGrammarLoading(false);
    }
  };

  const applyProposedDiff = () => {
    if (!resumeData || !diffData) return;

    if (diffData.type === "tailor") {
      setResumeData({
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          summary: diffData.proposed.summary
        },
        skills: diffData.proposed.skills,
        projects: diffData.proposed.projects
      });
      triggerNotification("AI Tailoring applied!");
    } else if (diffData.type === "tone") {
      const target = diffData.target;
      if (target === "summary") {
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            summary: diffData.proposed
          }
        });
      } else {
        const parts = target.split("-");
        const expIdx = parseInt(parts[1]);
        const bullIdx = parseInt(parts[2]);
        const updatedExp = [...resumeData.experience];
        updatedExp[expIdx].description[bullIdx] = diffData.proposed;
        setResumeData({ ...resumeData, experience: updatedExp });
      }
      triggerNotification("Wording Tone applied!");
    } else if (diffData.type === "grammar") {
      const target = diffData.target;
      if (target === "summary") {
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            summary: diffData.proposed
          }
        });
      } else {
        const parts = target.split("-");
        const expIdx = parseInt(parts[1]);
        const bullIdx = parseInt(parts[2]);
        const updatedExp = [...resumeData.experience];
        updatedExp[expIdx].description[bullIdx] = diffData.proposed;
        setResumeData({ ...resumeData, experience: updatedExp });
      }
      triggerNotification("Grammar correction applied!");
    }

    setDiffData(null);
  };

  // ----------------------------------------------------
  // Render Sections Accordion
  // ----------------------------------------------------
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[75vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Resume not found.</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 pb-16">
      {/* Save Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex items-center space-x-2 z-55 no-print"
          >
            <FileCheck className="w-5 h-5 text-emerald-450" />
            <span className="text-sm font-semibold">{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Builder Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200/50 dark:border-slate-800/40 no-print">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/resume")}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
              className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none text-slate-800 dark:text-white pb-0.5 max-w-[280px] sm:max-w-md truncate"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Live updates • PDF optimized
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-350 text-sm font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: EDIT FORM */}
        <div className="space-y-4 no-print">
          {/* Section: AI Power Upgrades */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-brand-500/20">
            <button
              type="button"
              onClick={() => toggleSection("ai-upgrades")}
              className="w-full flex items-center justify-between p-6 font-bold text-brand-600 dark:text-brand-450 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left bg-brand-500/[0.02]"
            >
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4.5 h-4.5 text-brand-500 animate-pulse" />
                <span>AI Power Upgrades</span>
              </span>
              {activeSection === "ai-upgrades" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "ai-upgrades" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-805 space-y-6 text-left">
                {/* 1. Tailor Resume */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    1. Role Tailoring Scanner
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Optimize your summary, skills, and projects details matching any target job description.
                  </p>
                  <textarea
                    rows={4}
                    value={jobDescriptionInput}
                    onChange={(e) => setJobDescriptionInput(e.target.value)}
                    placeholder="Paste target LinkedIn/Indeed job description details here..."
                    className="w-full px-4.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAITailor}
                      disabled={tailorLoading || !jobDescriptionInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-850 text-white font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                    >
                      {tailorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />}
                      <span>Tailor Match Resume</span>
                    </button>
                  </div>
                </div>

                {/* 2. Tone Changer */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-805">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    2. Dynamic Wording Tone Changer
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Select a target resume section and change its delivery style.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Target Section</label>
                      <select
                        value={toneTarget}
                        onChange={(e) => setToneTarget(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800/40 bg-transparent text-xs text-slate-900 dark:text-white"
                      >
                        <option value="summary" className="text-slate-900">Professional Summary</option>
                        {resumeData.experience.map((exp, expIdx) => 
                          exp.description.map((bullet, bulletIdx) => (
                            <option key={`${expIdx}-${bulletIdx}`} value={`exp-${expIdx}-${bulletIdx}`} className="text-slate-900">
                              Exp {expIdx + 1} - Bullet {bulletIdx + 1}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Wording Tone</label>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800/40 bg-transparent text-xs text-slate-900 dark:text-white"
                      >
                        <option value="bold" className="text-slate-900">Bold & Assertive</option>
                        <option value="executive" className="text-slate-900">Executive & Strategic</option>
                        <option value="minimalist" className="text-slate-900">Concise & Minimalist</option>
                        <option value="professional" className="text-slate-900">Standard Professional</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAITone}
                      disabled={toneLoading}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-850 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      {toneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-500" />}
                      <span>Change Wording Tone</span>
                    </button>
                  </div>
                </div>

                {/* 3. Grammar Scanner */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-805">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    3. Grammar & Typo Auditor
                  </h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Check your summary text for spelling errors, syntax flows, and typos.
                  </p>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAIGrammar(resumeData.personalInfo.summary, "summary")}
                      disabled={grammarLoading}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-850 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      {grammarLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5 text-brand-500" />}
                      <span>Scan Summary Grammar</span>
                    </button>
                  </div>

                  {/* Grammar results */}
                  {grammarResults && grammarResults.target === "summary" && (
                    <div className="p-4 rounded-2xl bg-brand-500/[0.03] border border-brand-500/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-450 uppercase">Audit Results:</span>
                        <button
                          onClick={() => setGrammarResults(null)}
                          className="text-[10px] text-slate-400 hover:text-red-505"
                        >
                          Clear
                        </button>
                      </div>

                      {grammarResults.errorsFound.length === 0 ? (
                        <p className="text-xs text-emerald-500 font-medium">✓ No spelling or grammar errors detected!</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs text-red-500 font-bold">Issues Identified:</p>
                          <ul className="list-disc pl-4 text-[11px] text-slate-500 space-y-0.5">
                            {grammarResults.errorsFound.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40 space-y-2">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Proposed Correction:</p>
                        <p className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs leading-relaxed italic text-slate-605">
                          &ldquo;{grammarResults.correctedText}&rdquo;
                        </p>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setDiffData({
                                type: "grammar",
                                target: "summary",
                                original: resumeData.personalInfo.summary,
                                proposed: grammarResults.correctedText,
                              });
                              setGrammarResults(null);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition"
                          >
                            Apply Fix
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Personal Info */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between p-6 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left"
            >
              <span>Personal Information</span>
              {activeSection === "personal" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "personal" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/40 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                      placeholder="+1 (555) 0199"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.website}
                      onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                      placeholder="https://janedoe.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      GitHub Profile
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                      placeholder="https://github.com/janed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                      className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                      placeholder="https://linkedin.com/in/janed"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Professional Summary
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      disabled={aiSummaryLoading}
                      className="text-xs text-brand-650 dark:text-brand-400 font-bold hover:underline flex items-center space-x-1"
                    >
                      {aiSummaryLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1 text-brand-500 animate-pulse" />
                      )}
                      <span>Generate with AI</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => handlePersonalInfoChange("summary", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                    placeholder="Describe your career milestones, highlights, and specialized technical stack."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Experience */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection("experience")}
              className="w-full flex items-center justify-between p-6 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left"
            >
              <span>Work Experience ({resumeData.experience.length})</span>
              {activeSection === "experience" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "experience" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/40 space-y-6">
                {resumeData.experience.map((exp, expIdx) => (
                  <div key={expIdx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 space-y-4 relative">
                    <button
                      onClick={() => handleRemoveField("experience", expIdx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleFieldChange("experience", expIdx, "company", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Job Position
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleFieldChange("experience", expIdx, "position", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. June 2024"
                          value={exp.startDate}
                          onChange={(e) => handleFieldChange("experience", expIdx, "startDate", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          End Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Present"
                          disabled={exp.current}
                          value={exp.current ? "Present" : exp.endDate}
                          onChange={(e) => handleFieldChange("experience", expIdx, "endDate", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-5">
                        <input
                          id={`current-${expIdx}`}
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => handleFieldChange("experience", expIdx, "current", e.target.checked)}
                          className="rounded border-slate-350 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor={`current-${expIdx}`} className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Current Role
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Bullet Accomplishments
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddExperienceBullet(expIdx)}
                          className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center"
                        >
                          <Plus className="w-3.5 h-3.5 mr-0.5" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {exp.description.map((bullet, bullIdx) => (
                          <div key={bullIdx} className="flex items-start space-x-2">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => handleExperienceBulletChange(expIdx, bullIdx, e.target.value)}
                              className="flex-grow px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                              placeholder="e.g. Optimized database query performance by 35%..."
                            />
                            <button
                              type="button"
                              onClick={() => handleOpenBulletAI(expIdx, bullIdx)}
                              className="p-2 rounded-xl bg-purple-500/10 text-purple-650 dark:text-purple-400 hover:bg-purple-550 hover:text-white transition"
                              title="Refine Bullet with AI"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            {exp.description.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveExperienceBullet(expIdx, bullIdx)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddField("experience")}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-500 font-semibold text-xs transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Education */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection("education")}
              className="w-full flex items-center justify-between p-6 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left"
            >
              <span>Education ({resumeData.education.length})</span>
              {activeSection === "education" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "education" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/40 space-y-6">
                {resumeData.education.map((edu, eduIdx) => (
                  <div key={eduIdx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 space-y-4 relative">
                    <button
                      onClick={() => handleRemoveField("education", eduIdx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          School / University
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleFieldChange("education", eduIdx, "school", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Degree Earned
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleFieldChange("education", eduIdx, "degree", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleFieldChange("education", eduIdx, "fieldOfStudy", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2020"
                          value={edu.startDate}
                          onChange={(e) => handleFieldChange("education", eduIdx, "startDate", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          End Date (or Expected)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2024"
                          value={edu.endDate}
                          onChange={(e) => handleFieldChange("education", eduIdx, "endDate", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddField("education")}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-500 font-semibold text-xs transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Projects */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection("projects")}
              className="w-full flex items-center justify-between p-6 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left"
            >
              <span>Projects ({resumeData.projects.length})</span>
              {activeSection === "projects" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "projects" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/40 space-y-6">
                {resumeData.projects.map((proj, projIdx) => (
                  <div key={projIdx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 space-y-4 relative">
                    <button
                      onClick={() => handleRemoveField("projects", projIdx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Project Title
                        </label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleFieldChange("projects", projIdx, "title", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Project Role / Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Developer / Link"
                          value={proj.url}
                          onChange={(e) => handleFieldChange("projects", projIdx, "url", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Project Description
                      </label>
                      <textarea
                        rows={3}
                        value={proj.description}
                        onChange={(e) => handleFieldChange("projects", projIdx, "description", e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        placeholder="Built a custom web app supporting..."
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddField("projects")}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-500 font-semibold text-xs transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Skills */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection("skills")}
              className="w-full flex items-center justify-between p-6 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left"
            >
              <span>Skills ({resumeData.skills.length})</span>
              {activeSection === "skills" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "skills" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/40 space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="new-skill-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value;
                        if (val) {
                          handleAddSkill(val);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                    placeholder="Type a skill and press Enter (e.g. Next.js 14)"
                    className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("new-skill-input") as HTMLInputElement;
                      if (input && input.value) {
                        handleAddSkill(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-4.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-650 dark:text-brand-400 text-xs font-semibold"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {resumeData.skills.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      No skills added yet. Add languages, frameworks, or tools.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Certificates */}
          <div className="glass-panel rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection("certificates")}
              className="w-full flex items-center justify-between p-6 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-left"
            >
              <span>Certificates ({resumeData.certificates.length})</span>
              {activeSection === "certificates" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSection === "certificates" && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/40 space-y-6">
                {resumeData.certificates.map((cert, certIdx) => (
                  <div key={certIdx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 space-y-4 relative">
                    <button
                      onClick={() => handleRemoveField("certificates", certIdx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Certificate Name
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleFieldChange("certificates", certIdx, "name", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => handleFieldChange("certificates", certIdx, "issuer", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Issue Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sept 2025"
                          value={cert.date}
                          onChange={(e) => handleFieldChange("certificates", certIdx, "date", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Credential Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={cert.url}
                          onChange={(e) => handleFieldChange("certificates", certIdx, "url", e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddField("certificates")}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-500 font-semibold text-xs transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certificate</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE RENDERED PREVIEW */}
        <div className="sticky top-20 print-page">
          {/* Template Selectors */}
          <div className="flex items-center justify-between mb-4 no-print bg-white/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Design:</span>
            <div className="flex space-x-1.5">
              {["modern", "minimal", "professional"].map((t) => (
                <button
                  key={t}
                  onClick={() => setResumeData({ ...resumeData, templateId: t })}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition capitalize ${
                    resumeData.templateId === t
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Render Preview */}
          <div className="w-full aspect-[1/1.4142] bg-white border border-slate-200 dark:border-transparent text-slate-800 p-8 sm:p-10 shadow-2xl rounded-2xl md:rounded-3xl overflow-y-auto max-h-[85vh] print-page relative text-left">
            {/* 1. TEMPLATE: MODERN */}
            {resumeData.templateId === "modern" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b-4 border-brand-500 pb-5">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
                    {resumeData.personalInfo.name || "Full Name"}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-500 font-semibold">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.website && (
                      <span className="text-brand-600 underline">{resumeData.personalInfo.website}</span>
                    )}
                    {resumeData.personalInfo.github && <span>GitHub: {resumeData.personalInfo.github.split("/").pop()}</span>}
                    {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin.split("/").pop()}</span>}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.personalInfo.summary && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider">Summary</h2>
                    <p className="text-xs leading-relaxed text-slate-650">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider border-b border-slate-100 pb-1">
                      Professional Experience
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <span className="font-extrabold text-slate-900">{exp.position}</span>
                              <span className="text-slate-400"> at </span>
                              <span className="font-bold text-brand-600">{exp.company}</span>
                            </div>
                            <span className="font-semibold text-slate-500 whitespace-nowrap">
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 pl-1">
                            {exp.description.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-xs text-slate-650 leading-relaxed list-item">
                                {bullet || "Draft point..."}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider border-b border-slate-100 pb-1">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900">{edu.degree}</span>
                            {edu.fieldOfStudy && <span> in {edu.fieldOfStudy}</span>}
                            <span className="block text-slate-500 font-semibold">{edu.school}</span>
                          </div>
                          <span className="font-semibold text-slate-500 whitespace-nowrap">
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider border-b border-slate-100 pb-1">
                      Projects
                    </h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="space-y-0.5 text-xs">
                          <div className="flex justify-between">
                            <span className="font-extrabold text-slate-900">{proj.title}</span>
                            {proj.url && <span className="text-[10px] text-brand-500 underline">{proj.url}</span>}
                          </div>
                          <p className="text-xs text-slate-650 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider border-b border-slate-100 pb-1">
                      Skills
                    </h2>
                    <p className="text-xs text-slate-650 leading-relaxed">
                      {resumeData.skills.join(" • ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. TEMPLATE: MINIMAL */}
            {resumeData.templateId === "minimal" && (
              <div className="space-y-6 text-slate-950 font-serif">
                {/* Header */}
                <div className="text-center space-y-1">
                  <h1 className="text-3xl tracking-wide uppercase font-light border-b border-slate-900 pb-2">
                    {resumeData.personalInfo.name || "Full Name"}
                  </h1>
                  <div className="flex justify-center flex-wrap gap-x-4 text-[10px] uppercase font-sans text-slate-500 tracking-wider">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.personalInfo.summary && (
                  <p className="text-xs italic leading-relaxed text-slate-700 text-center px-4">
                    {resumeData.personalInfo.summary}
                  </p>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="space-y-3 font-sans">
                    <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-200 pb-1">
                      Experience
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-bold">
                            <span>{exp.position} — {exp.company}</span>
                            <span className="font-normal text-slate-500">
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-705">
                            {exp.description.map((bullet, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="space-y-3 font-sans">
                    <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-200 pb-1">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span>
                            <strong className="font-bold">{edu.degree}</strong>, {edu.school}
                          </span>
                          <span className="text-slate-500">
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div className="space-y-2 font-sans">
                    <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-200 pb-1">
                      Technical Skills
                    </h2>
                    <p className="text-xs text-slate-700">
                      {resumeData.skills.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. TEMPLATE: PROFESSIONAL */}
            {resumeData.templateId === "professional" && (
              <div className="space-y-5">
                {/* Header */}
                <div className="space-y-2 border-l-4 border-indigo-650 pl-4">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {resumeData.personalInfo.name || "Full Name"}
                  </h1>
                  <p className="text-xs text-slate-550 flex flex-wrap gap-x-3">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.website && <span>• {resumeData.personalInfo.website}</span>}
                  </p>
                </div>

                {/* Summary */}
                {resumeData.personalInfo.summary && (
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">Professional Summary</h3>
                    <p className="leading-relaxed text-slate-650">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-0.5">Experience</h3>
                    <div className="space-y-3">
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-900">{exp.position} • {exp.company}</span>
                            <span className="font-semibold text-slate-500">
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-slate-650">
                            {exp.description.map((bullet, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-0.5">Education</h3>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>
                          <strong className="font-bold text-slate-900">{edu.degree}</strong>, {edu.school}
                        </span>
                        <span className="font-semibold text-slate-500">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-0.5">Skills</h3>
                    <p className="text-xs text-slate-650">
                      {resumeData.skills.join(" | ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI BULLET OPTIONS MODAL */}
      <AnimatePresence>
        {bulletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBulletModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-400 p-6 sm:p-8 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/50 dark:border-slate-800/65 z-10 relative overflow-hidden"
            >
              <button
                onClick={() => setBulletModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-brand-500 animate-pulse" />
                <span>Refine Bullet with AI</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Polishing your accomplishments using STAR impact methodology.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Original Draft
                  </label>
                  <p className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/40 dark:border-slate-800/20 text-xs italic text-slate-600 dark:text-slate-400">
                    &ldquo;{customBulletInput}&rdquo;
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    AI STAR Alternatives
                  </label>
                  
                  {aiBulletLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                      <span className="text-[10px] text-slate-400">Optimizing metrics & verbs...</span>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {bulletOptions.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectBulletOption(opt)}
                          className="w-full text-left p-4 rounded-xl border border-slate-200/50 dark:border-slate-855 hover:border-brand-500 hover:bg-brand-500/[0.02] dark:hover:bg-brand-500/[0.03] transition flex items-start space-x-3 group"
                        >
                          <span className="p-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="text-xs font-medium text-slate-750 dark:text-slate-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition">
                            {opt}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI VERSION COMPARISON / DIFF MODAL */}
      <AnimatePresence>
        {diffData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDiffData(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-400 p-6 sm:p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-800/65 z-10 relative"
            >
              <button
                onClick={() => setDiffData(null)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-brand-500 animate-pulse" />
                <span>Compare AI Modifications</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Review and selectively merge suggested edits into your resume draft.
              </p>

              <div className="mt-6 space-y-6">
                {/* 1. Tailor Diff */}
                {diffData.type === "tailor" && (
                  <div className="space-y-6">
                    {/* Summary Comparison */}
                    {diffData.original.summary !== diffData.proposed.summary && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-red-550 block mb-1">Original Summary</span>
                            <p className="leading-relaxed">&ldquo;{diffData.original.summary}&rdquo;</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700 dark:text-slate-200">
                            <span className="font-bold text-emerald-550 block mb-1">Proposed Tailored Summary</span>
                            <p className="leading-relaxed">&ldquo;{diffData.proposed.summary}&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills Comparison */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tailored Skills List</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-red-550 block mb-2">Original Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {diffData.original.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 text-[10px] font-semibold">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700 dark:text-slate-200">
                          <span className="font-bold text-emerald-550 block mb-2">Proposed Skills (Tailored/Added)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {diffData.proposed.skills.map((skill: string, idx: number) => {
                              const isNew = !diffData.original.skills.includes(skill);
                              return (
                                <span key={idx} className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${isNew ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-350' : 'bg-slate-200/50 dark:bg-slate-800'}`}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projects Comparison */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tailored Projects</h3>
                      <div className="space-y-4">
                        {diffData.proposed.projects.map((proj: any, pIdx: number) => {
                          const origProj = diffData.original.projects[pIdx];
                          if (!origProj || origProj.description === proj.description) return null;
                          return (
                            <div key={pIdx} className="space-y-2 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{proj.title}</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-slate-600 dark:text-slate-400">
                                  <span className="font-bold text-red-550 block mb-1">Original Description</span>
                                  <p className="leading-relaxed">{origProj.description}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700 dark:text-slate-200">
                                  <span className="font-bold text-emerald-550 block mb-1">Proposed Tailored Description</span>
                                  <p className="leading-relaxed">{proj.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Wording Tone or Grammar Diff */}
                {(diffData.type === "tone" || diffData.type === "grammar") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-red-550 block mb-2">Original Version</span>
                        <p className="leading-relaxed italic">&ldquo;{diffData.original}&rdquo;</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700 dark:text-slate-200">
                        <span className="font-bold text-emerald-550 block mb-2">
                          {diffData.type === "tone" ? "Proposed Tone Shift" : "Proposed Grammar Fix"}
                        </span>
                        <p className="leading-relaxed italic">&ldquo;{diffData.proposed}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    onClick={() => setDiffData(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition"
                  >
                    Reject Changes
                  </button>
                  <button
                    onClick={applyProposedDiff}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Merge AI Suggestion</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
