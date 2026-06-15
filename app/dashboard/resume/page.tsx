"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Loader2,
  X,
  Compass,
  ArrowRight,
} from "lucide-react";

interface ResumeItem {
  _id: string;
  title: string;
  templateId: string;
  updatedAt: string;
  skills: string[];
  experience: any[];
}

export default function ResumePage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resume");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreateLoading(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, templateId: selectedTemplate }),
      });

      if (res.ok) {
        const newResume = await res.json();
        router.push(`/dashboard/resume/${newResume._id}`);
      }
    } catch (err) {
      console.error(err);
      setCreateLoading(false);
    }
  };

  const templates = [
    { id: "modern", name: "Modern", desc: "A sleek layout featuring bold accents and structured columns.", color: "from-brand-500 to-indigo-500" },
    { id: "minimal", name: "Minimalist", desc: "Classic black and white formatting optimized for traditional firms.", color: "from-slate-700 to-slate-900" },
    { id: "professional", name: "Professional", desc: "A clean standard layout featuring highlighted section titles.", color: "from-sky-500 to-indigo-500" },
  ];

  return (
    <div className="relative z-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            My Resumes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build, edit, and organize multiple resume versions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-medium text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Resume</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
          <Compass className="w-16 h-16 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Resumes Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Create your first ATS-optimized resume. Choose from our professional, recruiter-approved templates.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={resume._id}
              className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:shadow-glass-md transition-all group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(resume._id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition truncate">
                    {resume.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-450 dark:text-slate-500">
                    <span className="flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      <span className="capitalize">{resume.templateId}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {resume.experience?.length || 0} work entries • {resume.skills?.length || 0} skills
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <Link
                  href={`/dashboard/resume/${resume._id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white text-sm font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <span>Edit Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-400 p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/50 dark:border-slate-800/60 z-10 relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create New Resume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Name your resume version and select a design template.
              </p>

              <form onSubmit={handleCreate} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-750 dark:text-slate-300 mb-1.5">
                    Resume Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Software Engineer - Frontend"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-750 dark:text-slate-300 mb-3">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`flex items-start text-left p-3.5 rounded-2xl border transition-all ${
                          selectedTemplate === tpl.id
                            ? "border-brand-500 bg-brand-500/5 dark:bg-brand-550/10 shadow-sm"
                            : "border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/20"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 border-brand-500 mt-1 mr-3 flex-shrink-0 flex items-center justify-center ${
                          selectedTemplate === tpl.id ? "bg-brand-500" : "bg-transparent"
                        }`} />
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                            {tpl.name}
                            {tpl.id === "modern" && (
                              <span className="text-[9px] font-semibold px-2 py-0.5 ml-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                                Popular
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                            {tpl.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 hover:from-brand-550 hover:to-indigo-600 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 transition disabled:opacity-75"
                  >
                    {createLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Builder</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
