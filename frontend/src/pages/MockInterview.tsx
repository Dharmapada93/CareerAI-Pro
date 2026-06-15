import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Award,
  Calendar,
  Loader2,
  Mic,
  MicOff,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Plus,
  UserCheck,
} from "lucide-react";
import { apiFetch } from "../services/api";
import VoiceInterviewerOrb from "../components/3d/VoiceInterviewerOrb";

interface QuestionResponse {
  question: string;
  answer?: string;
  feedback?: string;
  scores?: {
    technical: number;
    communication: number;
    confidence: number;
  };
  improvedAnswer?: string;
}

interface InterviewSessionData {
  _id: string;
  role: string;
  experienceLevel: string;
  status: "pending" | "completed";
  questions: QuestionResponse[];
  overallScores?: {
    technical: number;
    communication: number;
    confidence: number;
  };
  overallFeedback?: string;
  createdAt: string;
}

export default function MockInterview() {
  const { id: sessionId } = useParams<{ id: string }>();

  if (sessionId) {
    return <InterviewSessionRoom sessionId={sessionId} />;
  }

  return <InterviewSetupPanel />;
}

// SETUP PANEL COMPONENT
function InterviewSetupPanel() {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<InterviewSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedLevel, setSelectedLevel] = useState("Junior");
  const [startLoading, setStartLoading] = useState(false);

  const roles = [
    "Frontend Developer",
    "Full Stack Developer",
    "Backend Developer",
    "Data Analyst",
    "ML Engineer",
    "DevOps Engineer",
  ];

  const levels = ["Junior", "Mid-Level", "Senior"];

  const fetchSessions = async () => {
    try {
      const data = await apiFetch("/interview");
      setSessions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartLoading(true);

    try {
      const session = await apiFetch("/interview", {
        method: "POST",
        body: { role: selectedRole, experienceLevel: selectedLevel },
      });

      if (session && session._id) {
        navigate(`/dashboard/interview/${session._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <div className="relative z-10 pb-16">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <MessageSquare className="w-8 h-8 text-brand-500" />
          <span>AI Mock Interview</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simulate tech interviews with custom AI questions. Answer by text or simulated voice recorder and receive granular performance reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO COLUMNS: SETUP CONFIG */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-white/75 dark:bg-dark-350/75">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-brand-500 animate-pulse" />
              <span>Configure Session</span>
            </h3>

            <form onSubmit={handleStart} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Role Target
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-transparent text-sm text-slate-900 dark:text-white"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} className="text-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {levels.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setSelectedLevel(l)}
                        className={`py-3 rounded-2xl text-xs font-bold border transition ${
                          selectedLevel === l
                            ? "border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400"
                            : "border-slate-200/50 dark:border-slate-800/40 text-slate-500 hover:bg-slate-550/5"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/30 flex justify-end">
                <button
                  type="submit"
                  disabled={startLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-70 disabled:pointer-events-none"
                >
                  {startLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating AI Questions...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Start Interview Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: SESSION HISTORY */}
        <div className="glass-panel p-6 rounded-3xl text-left bg-white/75 dark:bg-dark-350/75">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-slate-400" />
            <span>Session History</span>
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-450" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-slate-450 dark:text-slate-550 text-center py-12">
              No previous interviews found. Initiate your first session on the left.
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => {
                const avgScore = sess.overallScores
                  ? Math.round(
                      (sess.overallScores.technical +
                        sess.overallScores.communication +
                        sess.overallScores.confidence) /
                        3
                    )
                  : 0;

                return (
                  <button
                    key={sess._id}
                    onClick={() => navigate(`/dashboard/interview/${sess._id}`)}
                    className="w-full text-left p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-900/10 transition flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">
                        {sess.role}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Level: {sess.experienceLevel}
                      </p>
                      <span className="text-[9px] font-semibold text-slate-400 flex items-center mt-2.5">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-405" />
                        {new Date(sess.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      {sess.status === "completed" ? (
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                          avgScore >= 80
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
                            : avgScore >= 60
                            ? "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-450"
                        }`}>
                          <Award className="w-3.5 h-3.5 mr-0.5" />
                          <span>{avgScore}%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-105 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center">
                          <span>Resume</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// SESSION ROOM COMPONENT
interface RoomProps {
  sessionId: string;
}

function InterviewSessionRoom({ sessionId }: RoomProps) {
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Room states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice simulation
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const fetchSession = useCallback(async () => {
    try {
      const data = await apiFetch(`/interview/${sessionId}`);
      if (data) {
        setSession(data);
        if (data.status === "pending") {
          const firstUnanswered = data.questions.findIndex((q: any) => !q.answer);
          setCurrentIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
        }
      } else {
        navigate("/dashboard/interview");
      }
    } catch (err) {
      console.error(err);
      navigate("/dashboard/interview");
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    fetchSession();
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, [fetchSession]);

  const handleSpeakQuestion = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(session?.questions[currentIndex]?.question || "");
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const detectFillerWords = (text: string) => {
    const fillers = ["um", "ah", "like", "so", "you know"];
    const detected: { word: string; count: number }[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    fillers.forEach((f) => {
      let count = 0;
      if (f === "you know") {
        let idx = text.toLowerCase().indexOf("you know");
        while (idx !== -1) {
          count++;
          idx = text.toLowerCase().indexOf("you know", idx + 8);
        }
      } else {
        count = words.filter((w) => w.replace(/[^a-z]/g, "") === f).length;
      }
      if (count > 0) {
        detected.push({ word: f, count });
      }
    });
    return detected;
  };

  const startRecording = () => {
    setError("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              text += event.results[i][0].transcript + " ";
            }
          }
          setUserAnswer((prev) => (prev + " " + text).trim());
        };

        recognition.onerror = (e: any) => {
          console.error("Speech Recognition Error", e);
        };

        recognition.onend = () => {
          setRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setRecording(true);
        setRecSeconds(0);
        recTimerRef.current = setInterval(() => {
          setRecSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.warn("STT initiation error, using fallback.");
        runRecordingSimulation();
      }
    } else {
      runRecordingSimulation();
    }
  };

  const runRecordingSimulation = () => {
    setRecording(true);
    setRecSeconds(0);
    recTimerRef.current = setInterval(() => {
      setRecSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    setRecording(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }

    // Provide a contextual high-quality mock transcribed response based on standard questions
    const questionText = session?.questions[currentIndex]?.question.toLowerCase() || "";
    let mockTranscription = "In my previous projects, I resolved this by utilizing a modular design and setting up robust caching policies to optimize performance. I focused on clean coding paradigms and documented the integration thoroughly.";
    
    if (questionText.includes("next.js") || questionText.includes("server") || questionText.includes("client")) {
      mockTranscription = "Next.js 14 Server Components run directly on the server to reduce the JavaScript bundle sent to the client, improving initial page load. Client Components are used when user interaction is required, such as state, effects, or browser APIs like window.";
    } else if (questionText.includes("mongodb") || questionText.includes("index") || questionText.includes("database")) {
      mockTranscription = "To optimize a slow MongoDB find query, I'd first check the query execution plan using explain(). Then, I would create appropriate single-field or compound indexes, restrict fields returned using projection, and leverage Aggregation Pipelines where needed.";
    } else if (questionText.includes("state") || questionText.includes("context") || questionText.includes("redux")) {
      mockTranscription = "I use React Context API for low-frequency global updates like theme switches or user authentication. For high-frequency state updates or large-scale shared stores, I prefer Zustand or Redux to avoid unnecessary re-renders.";
    }

    setUserAnswer(mockTranscription);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setError("");
    setSubmitting(true);

    try {
      const updatedSession = await apiFetch(`/interview/${sessionId}`, {
        method: "PUT",
        body: { questionIndex: currentIndex, userAnswer },
      });

      setSession(updatedSession);
      setEvalResult(updatedSession.questions[currentIndex]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Communication issue with evaluator. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setEvalResult(null);
    setUserAnswer("");
    
    if (session) {
      const nextIdx = currentIndex + 1;
      if (nextIdx < session.questions.length) {
        setCurrentIndex(nextIdx);
      } else {
        // Refresh session to show final report page
        fetchSession();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[75vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Interview session not found.</p>
      </div>
    );
  }

  const overallAvg = session.overallScores
    ? Math.round(
        (session.overallScores.technical +
          session.overallScores.communication +
          session.overallScores.confidence) /
          3
      )
    : 0;

  return (
    <div className="relative z-10 pb-16">
      {/* Back to Interviews & Print */}
      <div className="mb-6 flex justify-between items-center no-print">
        <button
          onClick={() => navigate("/dashboard/interview")}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mock Setup</span>
        </button>

        {session.status === "completed" && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-655 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition"
          >
            <span>Download Report PDF</span>
          </button>
        )}
      </div>

      {/* CASE 1: SESSION COMPLETED - SHOW FINAL REPORT */}
      {session.status === "completed" ? (
        <div className="space-y-8">
          {/* Top Banner Report */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/75 dark:bg-dark-350/75">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 max-w-2xl text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                Final Report Compiled
              </span>
              <h1 className="text-2xl font-extrabold text-slate-805 dark:text-white">
                {session.role} Interview Results
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {session.overallFeedback}
              </p>
            </div>

            <div className="flex flex-row space-x-4">
              <div className="text-center p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-[10px] font-bold text-emerald-505 uppercase">Average Score</p>
                <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-1">
                  {overallAvg}%
                </h3>
              </div>
            </div>
          </div>

          {/* Scores breakups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tech depth */}
            <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/75 dark:bg-dark-350/75 text-left">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Technical Score
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {session.overallScores?.technical}%
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Comm score */}
            <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/75 dark:bg-dark-350/75 text-left">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Communication
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {session.overallScores?.communication}%
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            {/* Confidence */}
            <div className="glass-panel p-6 rounded-3xl flex items-center justify-between bg-white/75 dark:bg-dark-350/75 text-left">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Confidence
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {session.overallScores?.confidence}%
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Questions and Feedback breakdown */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white text-left">Detailed Questions Breakdown</h3>
            
            {session.questions.map((q, qIdx) => (
              <div key={qIdx} className="glass-panel p-6 rounded-3xl space-y-4 text-left bg-white/75 dark:bg-dark-350/75">
                <div className="flex items-start space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex-shrink-0">
                    {qIdx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                      {q.question}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/30">
                  <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
                      Your Answer
                    </p>
                    <p className="text-xs text-slate-650 italic leading-relaxed dark:text-slate-350">
                      &ldquo;{q.answer || "No response provided."}&rdquo;
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        AI Evaluator Feedback
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        Score: {q.scores ? Math.round((q.scores.technical + q.scores.communication + q.scores.confidence) / 3) : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {q.feedback}
                    </p>
                  </div>
                </div>

                {q.improvedAnswer && (
                  <div className="bg-brand-500/[0.03] border border-brand-500/10 p-4 rounded-2xl mt-4">
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Model Answer Suggestion</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                      {q.improvedAnswer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CASE 2: SESSION PENDING - SHOW INTERACTIVE ROOM */
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
              Mock Room: {session.role}
            </span>
            <span className="text-xs font-bold text-brand-650 dark:text-brand-400">
              Question {currentIndex + 1} of {session.questions.length}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / session.questions.length) * 100}%` }}
            />
          </div>

          {/* 3D Interviewer Orb Visualizer */}
          {!evalResult && (
            <div className="glass-panel p-4 rounded-3xl overflow-hidden bg-white/50 dark:bg-dark-350/50 backdrop-blur-md">
              <VoiceInterviewerOrb isSpeaking={isSpeaking} isListening={recording} />
            </div>
          )}

          {/* Active Question Box */}
          <AnimatePresence mode="wait">
            {!evalResult ? (
              <motion.div
                key="question-box"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 text-left bg-white/75 dark:bg-dark-350/75"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex p-2 rounded-xl bg-brand-500/10 text-brand-650 dark:text-brand-400">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-805 dark:text-white leading-snug">
                      {session.questions[currentIndex]?.question}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    className="p-3 rounded-2xl bg-brand-500/10 text-brand-650 dark:text-brand-400 hover:bg-brand-600 hover:text-white transition duration-200 mt-1 flex-shrink-0"
                    title="Read Question Aloud"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Your Technical Answer
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your structured explanation here... Or click the voice recorder to speak your answer."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Voice simulation control bar */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30">
                    <div className="flex items-center space-x-3">
                      {recording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center space-x-1.5 animate-pulse"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Stop ({recSeconds}s)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center space-x-1.5"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Speak Answer</span>
                        </button>
                      )}
                      <span className="text-[10px] text-slate-450 dark:text-slate-500">
                        {recording ? "Recording audio stream..." : "Click to simulate voice transcribing"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={submitting || !userAnswer.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Evaluating answer...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Answer</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* GRADING FEEDBACK BANNER */
              <motion.div
                key="evaluation-box"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 text-left border-brand-500/30 bg-white/75 dark:bg-dark-350/75"
              >
                <div className="flex items-center space-x-3 text-emerald-500">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <h3 className="text-lg font-bold">Question Evaluated!</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-brand-500/5 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-450 font-bold uppercase">Technical</p>
                    <p className="text-xl font-bold text-brand-600 dark:text-brand-405 mt-1">
                      {evalResult.scores?.technical}%
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-500/5 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-450 font-bold uppercase">Communication</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {evalResult.scores?.communication}%
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/5 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-450 font-bold uppercase">Confidence</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-450 mt-1">
                      {evalResult.scores?.confidence}%
                    </p>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/30 p-4.5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Critique & Improvement</p>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mt-1">{evalResult.feedback}</p>
                </div>

                {detectFillerWords(userAnswer).length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-600 space-y-1.5">
                    <p className="font-bold flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500" />
                      <span>Speech Filler Words Flagged</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      We detected these repeated filler terms:{" "}
                      <strong>
                        {detectFillerWords(userAnswer)
                          .map((d) => `"${d.word}" (${d.count}x)`)
                          .join(", ")}
                      </strong>
                      . Try pausing briefly instead of voicing transitions to improve communication and confidence ratings.
                    </p>
                  </div>
                )}

                {evalResult.improvedAnswer && (
                  <div className="space-y-1 bg-brand-500/[0.02] border border-brand-500/5 p-4.5 rounded-2xl">
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Suggested Model Response</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mt-1 italic font-mono">
                      &ldquo;{evalResult.improvedAnswer}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition"
                  >
                    <span>
                      {currentIndex + 1 < session.questions.length ? "Next Question" : "Compile Final Report"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
