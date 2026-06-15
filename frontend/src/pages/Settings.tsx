import React, { useState, useEffect } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Key,
  Shield,
  Loader2,
  Check,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  Eye,
} from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme, reducedMotion, toggleReducedMotion } = useThemeStore();

  // Notification states
  const [emailNotify, setEmailNotify] = useState(true);
  const [whatsappNotify, setWhatsappNotify] = useState(false);
  const [newsletters, setNewsletters] = useState(true);

  // AI settings
  const [mockMode, setMockMode] = useState(true);
  const [geminiKey, setGeminiKey] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("settings_email") !== "false";
    const savedWhatsapp = localStorage.getItem("settings_whatsapp") === "true";
    const savedNews = localStorage.getItem("settings_news") !== "false";
    const savedKey = localStorage.getItem("settings_gemini_key") || "";
    const savedMock = localStorage.getItem("settings_mock_mode") !== "false";

    setEmailNotify(savedEmail);
    setWhatsappNotify(savedWhatsapp);
    setNewsletters(savedNews);
    setGeminiKey(savedKey);
    setMockMode(savedMock);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    setTimeout(() => {
      localStorage.setItem("settings_email", emailNotify ? "true" : "false");
      localStorage.setItem("settings_whatsapp", whatsappNotify ? "true" : "false");
      localStorage.setItem("settings_news", newsletters ? "true" : "false");
      localStorage.setItem("settings_gemini_key", geminiKey);
      localStorage.setItem("settings_mock_mode", mockMode ? "true" : "false");

      setSuccessMsg("Settings saved successfully!");
      setSaveLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 800);
  };

  return (
    <div className="relative z-10 pb-16 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <SettingsIcon className="w-8 h-8 text-brand-500" />
          <span>System Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust notifications preferences, UI interface appearance, and AI microservice parameters.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-550/15 text-emerald-600 dark:text-emerald-450 rounded-2xl text-xs max-w-md">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          {/* Theme & Display card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 bg-white/70 dark:bg-dark-350/70">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <Sun className="w-4.5 h-4.5 mr-2 text-amber-500" />
              <span>Theme Appearance</span>
            </h3>
            <div className="flex items-center justify-between p-4.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Dark / Light Mode Toggle</p>
                <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">
                  Change the overall interface background theme.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-550 transition flex items-center"
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </button>
            </div>
            
            {/* Reduced motion Accessibility toggle */}
            <div className="flex items-center justify-between p-4.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Accessibility: Reduced Motion</p>
                <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">
                  Halts complex R3F 3D loops to improve battery life and prevent lag.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleReducedMotion}
                className="p-1 text-slate-450"
              >
                {reducedMotion ? (
                  <ToggleRight className="w-10 h-10 text-brand-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-350" />
                )}
              </button>
            </div>
          </div>

          {/* AI configurations */}
          <div className="glass-panel p-6 rounded-3xl space-y-5 bg-white/70 dark:bg-dark-350/70">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center">
              <Key className="w-4.5 h-4.5 mr-2 text-indigo-500" />
              <span>AI Microservice Configuration</span>
            </h3>

            <div className="space-y-4.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Force Mock Mode Fallback</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Fallback to mocked local prompts if connection fails.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMockMode(!mockMode)}
                  className="p-1 text-slate-450"
                >
                  {mockMode ? (
                    <ToggleRight className="w-10 h-10 text-brand-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-350" />
                  )}
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/30">
                <label className="block text-xs font-bold text-slate-750 dark:text-slate-250">
                  Custom Gemini API Key
                </label>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 mb-2 leading-relaxed">
                  Keys are stored locally in the browser sandbox. Entering a key allows testing authentic generation without configuring backend environment variables.
                </p>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATION SETTINGS */}
        <div className="glass-panel p-6 rounded-3xl space-y-5 bg-white/70 dark:bg-dark-350/70">
          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center">
            <Bell className="w-4.5 h-4.5 mr-2 text-brand-500" />
            <span>Alerts & Logs</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Email Alerts</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[160px]">
                  Receive updates about ATS scores on file.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="rounded border-slate-350 text-brand-650 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-start justify-between border-t border-slate-100 dark:border-slate-800/30 pt-3">
              <div>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">WhatsApp Shares</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[160px]">
                  Get notifications when someone views your portfolio link.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappNotify}
                onChange={(e) => setWhatsappNotify(e.target.checked)}
                className="rounded border-slate-350 text-brand-650 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-start justify-between border-t border-slate-100 dark:border-slate-800/30 pt-3">
              <div>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Weekly Digest</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[160px]">
                  Job keyword optimizations list and tips.
                </p>
              </div>
              <input
                type="checkbox"
                checked={newsletters}
                onChange={(e) => setNewsletters(e.target.checked)}
                className="rounded border-slate-350 text-brand-650 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/40">
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-70"
            >
              {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
              <span>Save System Parameters</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
