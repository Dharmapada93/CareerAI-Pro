import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Sparkles,
  ClipboardList,
  Edit2,
  X,
  Check,
  ArrowRight,
  Loader2,
  Mail,
  Copy
} from "lucide-react";
import { apiFetch } from "../services/api";

interface ChecklistItem {
  text: string;
  completed: boolean;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  status: "Applied" | "Interview" | "Selected" | "Rejected";
  appliedDate: string;
  notes?: string;
  checklist: ChecklistItem[];
}

export default function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states (Add)
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newStatus, setNewStatus] = useState<"Applied" | "Interview" | "Selected" | "Rejected">("Applied");
  const [newNotes, setNewNotes] = useState("");
  const [newChecklist, setNewChecklist] = useState<ChecklistItem[]>([
    { text: "Tailor resume", completed: false },
    { text: "Submit application", completed: true },
    { text: "Prepare elevator pitch", completed: false }
  ]);
  const [newChecklistText, setNewChecklistText] = useState("");

  // Edit/Detail States
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editStatus, setEditStatus] = useState<"Applied" | "Interview" | "Selected" | "Rejected">("Applied");
  const [editNotes, setEditNotes] = useState("");
  const [editChecklist, setEditChecklist] = useState<ChecklistItem[]>([]);
  const [editChecklistText, setEditChecklistText] = useState("");

  // AI Followup generation state
  const [aiEmail, setAiEmail] = useState("");
  const [aiEmailLoading, setAiEmailLoading] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/job");
      setJobs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    try {
      await apiFetch("/job", {
        method: "POST",
        body: {
          title: newTitle,
          company: newCompany,
          status: newStatus,
          notes: newNotes,
          checklist: newChecklist,
          appliedDate: new Date().toISOString()
        }
      });

      setIsAddOpen(false);
      resetAddForm();
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;
    try {
      await apiFetch("/job", {
        method: "PUT",
        body: {
          id: selectedJob._id,
          title: editTitle,
          company: editCompany,
          status: editStatus,
          notes: editNotes,
          checklist: editChecklist
        }
      });

      setIsDetailOpen(false);
      setSelectedJob(null);
      setAiEmail("");
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (jobId: string, newStat: "Applied" | "Interview" | "Selected" | "Rejected") => {
    try {
      await apiFetch("/job", {
        method: "PUT",
        body: {
          id: jobId,
          status: newStat
        }
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    try {
      await apiFetch(`/job?id=${id}`, {
        method: "DELETE"
      });
      setIsDetailOpen(false);
      setSelectedJob(null);
      setAiEmail("");
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetail = (job: Job) => {
    setSelectedJob(job);
    setEditTitle(job.title);
    setEditCompany(job.company);
    setEditStatus(job.status);
    setEditNotes(job.notes || "");
    setEditChecklist(job.checklist || []);
    setIsDetailOpen(true);
    setAiEmail("");
  };

  const handleGenerateOutreach = async () => {
    if (!selectedJob) return;
    setAiEmailLoading(true);
    setAiEmail("");
    try {
      const data = await apiFetch("/career-coach", {
        method: "POST",
        body: {
          type: "outreach",
          payload: {
            company: editCompany,
            role: editTitle,
            context: editNotes || "Applying as a qualified professional."
          }
        }
      });
      setAiEmail(data.email || "");
    } catch (err) {
      console.error(err);
    } finally {
      setAiEmailLoading(false);
    }
  };

  const resetAddForm = () => {
    setNewTitle("");
    setNewCompany("");
    setNewStatus("Applied");
    setNewNotes("");
    setNewChecklist([
      { text: "Tailor resume", completed: false },
      { text: "Submit application", completed: true },
      { text: "Prepare elevator pitch", completed: false }
    ]);
  };

  const addChecklistItem = (isEdit: boolean) => {
    const text = isEdit ? editChecklistText : newChecklistText;
    if (!text.trim()) return;

    if (isEdit) {
      setEditChecklist([...editChecklist, { text: text.trim(), completed: false }]);
      setEditChecklistText("");
    } else {
      setNewChecklist([...newChecklist, { text: text.trim(), completed: false }]);
      setNewChecklistText("");
    }
  };

  const removeChecklistItem = (isEdit: boolean, idx: number) => {
    if (isEdit) {
      const updated = [...editChecklist];
      updated.splice(idx, 1);
      setEditChecklist(updated);
    } else {
      const updated = [...newChecklist];
      updated.splice(idx, 1);
      setNewChecklist(updated);
    }
  };

  const toggleChecklistItem = (isEdit: boolean, idx: number) => {
    if (isEdit) {
      const updated = [...editChecklist];
      updated[idx].completed = !updated[idx].completed;
      setEditChecklist(updated);
    } else {
      const updated = [...newChecklist];
      updated[idx].completed = !updated[idx].completed;
      setNewChecklist(updated);
    }
  };

  const columns: Array<{ id: Job["status"]; name: string; borderClass: string; textClass: string; bgClass: string }> = [
    { id: "Applied", name: "Applied", borderClass: "border-blue-500/30", textClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-500/[0.02]" },
    { id: "Interview", name: "Interview", borderClass: "border-purple-500/30", textClass: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-500/[0.02]" },
    { id: "Selected", name: "Selected", borderClass: "border-emerald-500/30", textClass: "text-emerald-600 dark:text-emerald-450", bgClass: "bg-emerald-500/[0.02]" },
    { id: "Rejected", name: "Rejected", borderClass: "border-rose-500/30", textClass: "text-rose-600 dark:text-rose-450", bgClass: "bg-rose-500/[0.02]" }
  ];

  return (
    <div className="relative z-10 pb-16 max-w-7xl mx-auto px-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800/40">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <ClipboardList className="w-8 h-8 text-brand-500" />
            <span>AI Job Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize your application pipeline, checklist progress, and utilize AI draft scripts.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="mt-4 sm:mt-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-36">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        /* Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map((col) => {
            const filtered = jobs.filter((j) => j.status === col.id);
            return (
              <div
                key={col.id}
                className={`glass-panel border-t-4 ${col.borderClass} ${col.bgClass} rounded-3xl p-5 min-h-[60vh] flex flex-col`}
              >
                {/* Column header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/40 dark:border-slate-800/30">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.textClass}`}>
                    {col.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400">
                    {filtered.length}
                  </span>
                </div>

                {/* Column body cards */}
                <div className="space-y-4 flex-grow overflow-y-auto">
                  {filtered.map((job) => {
                    const totalTasks = job.checklist?.length || 0;
                    const completedTasks = job.checklist?.filter((t) => t.completed).length || 0;
                    return (
                      <motion.div
                        key={job._id}
                        layoutId={job._id}
                        onClick={() => handleOpenDetail(job)}
                        className="p-4 rounded-2xl bg-white dark:bg-dark-400 border border-slate-202 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-brand-500/40 dark:hover:border-brand-500/30 transition text-left cursor-pointer relative group"
                      >
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate pr-6 group-hover:text-brand-600 dark:group-hover:text-brand-405">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold truncate mt-0.5">
                          {job.company}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-450 font-semibold">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recent"}
                          </span>

                          {totalTasks > 0 && (
                            <span className="flex items-center">
                              <CheckSquare className="w-3 h-3 mr-1 text-slate-400" />
                              {completedTasks}/{totalTasks}
                            </span>
                          )}
                        </div>

                        {/* Quick move status icons */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          {col.id !== "Interview" && col.id !== "Selected" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(job._id, "Interview");
                              }}
                              className="p-1 rounded bg-purple-500/10 text-purple-650 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition"
                              title="Move to Interview"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div className="h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 flex items-center justify-center text-[10px] text-slate-400">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD APPLICATION MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-400 p-6 sm:p-8 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/50 dark:border-slate-800/65 z-10 relative text-left"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-brand-500" />
                <span>Track New Application</span>
              </h2>

              <form onSubmit={handleAddJob} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer II"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1">Company</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1">Status Column</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800/40 bg-transparent text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Applied" className="text-slate-950">Applied</option>
                      <option value="Interview" className="text-slate-950">Interview</option>
                      <option value="Selected" className="text-slate-955">Selected</option>
                      <option value="Rejected" className="text-slate-955">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1">Notes / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Reference links, salary expectation, or referral details..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Checklist Builder */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-500 uppercase">Preparation Checklist</label>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add step..."
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addChecklistItem(false);
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addChecklistItem(false)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-2 mt-2">
                    {newChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-202/30 dark:border-slate-800/30">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(false, idx)}
                            className="rounded border-slate-350 text-brand-655 focus:ring-brand-500"
                          />
                          <span className={`text-[11px] font-medium ${item.completed ? "line-through text-slate-400" : "text-slate-755 dark:text-slate-300"}`}>
                            {item.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(false, idx)}
                          className="text-slate-450 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4.5 py-2.5 rounded-xl border border-slate-205 text-slate-655 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition"
                  >
                    Track App
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL & EDITOR MODAL */}
      <AnimatePresence>
        {isDetailOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDetailOpen(false);
                setSelectedJob(null);
                setAiEmail("");
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-400 p-6 sm:p-8 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-800/65 z-10 relative text-left grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedJob(null);
                  setAiEmail("");
                }}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Form detail editor */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Edit2 className="w-5 h-5 mr-2 text-brand-500" />
                  <span>Update Details</span>
                </h2>

                <div className="space-y-3 pt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company</label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800/40 bg-transparent text-xs text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="Applied" className="text-slate-950">Applied</option>
                      <option value="Interview" className="text-slate-955">Interview</option>
                      <option value="Selected" className="text-slate-955">Selected</option>
                      <option value="Rejected" className="text-slate-955">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Referrals</label>
                    <textarea
                      rows={4}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-105 dark:border-slate-800/45">
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(selectedJob._id)}
                    className="px-3.5 py-2 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Application</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateJob}
                    className="px-5 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs rounded-xl hover:scale-[1.02] transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Right Column: Checklists & AI email drafts */}
              <div className="border-t md:border-t-0 md:border-l border-slate-200/40 dark:border-slate-800/40 pt-4 md:pt-0 md:pl-6 space-y-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-3 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-1 text-slate-400" />
                    <span>Interview Checklists</span>
                  </h3>

                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add next checklist step..."
                      value={editChecklistText}
                      onChange={(e) => setEditChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addChecklistItem(true);
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-[11px] text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addChecklistItem(true)}
                      className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-white"
                    >
                      Add
                    </button>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-2">
                    {editChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-202/30 dark:border-slate-800/30">
                        <div className="flex items-center space-x-2 text-left">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(true, idx)}
                            className="rounded border-slate-350 text-brand-600 focus:ring-brand-500"
                          />
                          <span className={`text-[11px] font-medium leading-tight ${item.completed ? "line-through text-slate-405" : "text-slate-700 dark:text-slate-300"}`}>
                            {item.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(true, idx)}
                          className="text-slate-450 hover:text-red-500 flex-shrink-0 ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {editChecklist.length === 0 && (
                      <p className="text-[11px] text-slate-450 italic">No checklist items. Add one above.</p>
                    )}
                  </div>
                </div>

                {/* AI Recruiter Outreach */}
                <div className="pt-4 border-t border-slate-105 dark:border-slate-800/45 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-455 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-brand-500" />
                      <span>AI Outreach Email</span>
                    </h4>
                    
                    {!aiEmail && (
                      <button
                        type="button"
                        onClick={handleGenerateOutreach}
                        disabled={aiEmailLoading}
                        className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center"
                      >
                        {aiEmailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1 text-brand-500" />}
                        <span>Draft Outreach</span>
                      </button>
                    )}
                  </div>

                  {aiEmailLoading && (
                    <div className="py-6 flex flex-col items-center justify-center space-y-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/30">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                      <span className="text-[9px] text-slate-400">Synthesizing follow-up copy...</span>
                    </div>
                  )}

                  {aiEmail && (
                    <div className="p-3.5 rounded-xl bg-brand-500/[0.02] border border-brand-500/10 space-y-2 relative">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800/40">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Follow-up Template:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(aiEmail);
                            setEmailCopied(true);
                            setTimeout(() => setEmailCopied(false), 2000);
                          }}
                          className="text-[9px] font-bold text-brand-600 dark:text-brand-400 flex items-center"
                        >
                          {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-0.5" /> : <Copy className="w-3 h-3 mr-0.5" />}
                          <span>{emailCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {aiEmail}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
