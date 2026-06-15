import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { apiFetch } from "../services/api";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function Pricing() {
  const { isAuthenticated, user, updateUserSubscription } = useAuthStore();
  const navigate = useNavigate();

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpgrade = async (planName: "Free" | "Pro" | "Enterprise") => {
    if (!isAuthenticated) {
      navigate(`/login?callbackUrl=/pricing`);
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setUpgradingPlan(planName);

    try {
      const data = await apiFetch("/profile", {
        method: "PUT",
        body: { subscription: planName },
      });

      setSuccessMsg(`Congratulations! You have upgraded to the ${planName} Plan.`);
      updateUserSubscription(planName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to complete mock upgrade. Try again.");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      desc: "Perfect for exploring core functionalities and drafting your first resume.",
      features: [
        "1 Resume builder draft",
        "1 ATS score scan",
        "1 AI Mock interview session",
        "Basic recruiter templates",
      ],
      actionLabel: "Current Plan",
    },
    {
      name: "Pro",
      price: billingPeriod === "annually" ? 14 : 19,
      desc: "Crucial for active job seekers, freshers, and university graduates.",
      features: [
        "Unlimited Resumes",
        "Unlimited ATS score scans",
        "Unlimited AI Mock interviews",
        "Cover Letter Generator",
        "Developer Portfolio Builder",
        "AI Bullet PointSTAR optimizer",
        "Priority AI queuing response",
      ],
      actionLabel: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: billingPeriod === "annually" ? 39 : 49,
      desc: "Custom structures for schools, bootcamp graduates, and team placements.",
      features: [
        "Everything in Pro plan",
        "LinkedIn profile optimizer audits",
        "WhatsApp share link analytics",
        "1-on-1 career advisor reviewer feedback",
        "Custom domain mapping configurations",
        "Dedicated account support",
      ],
      actionLabel: "Get Enterprise",
    },
  ];

  return (
    <div className="relative z-10 py-16 px-4 max-w-7xl mx-auto text-center">
      {/* Header */}
      <div className="space-y-4 mb-10 max-w-3xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full">
          Simple Subscription Model
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          SaaS Pricing Plans
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400">
          Pick a subscription model that fits your job hunting pace. Upgrade or downgrade instantly.
        </p>

        {/* Billing period switcher */}
        <div className="pt-6 flex justify-center">
          <div className="relative p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex items-center space-x-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                billingPeriod === "monthly" ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-sm" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1 ${
                billingPeriod === "annually" ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-sm" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span>Annually</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold">
                -25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-8 max-w-md mx-auto flex items-center space-x-2 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-2xl text-sm justify-center">
          <Sparkles className="w-5 h-5 flex-shrink-0 animate-bounce text-emerald-500" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-8 max-w-md mx-auto flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm justify-center">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Grid plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-16 text-left">
        {plans.map((p) => {
          const isUserPlan = user?.subscription === p.name;

          return (
            <div
              key={p.name}
              className={`glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full hover:shadow-glass-md transition duration-300 ${
                p.popular ? "border-brand-500/50 shadow-brand-500/5" : ""
              }`}
            >
              {p.popular && (
                <span className="absolute top-4 right-4 text-[9px] font-bold px-2.5 py-1 rounded-full bg-brand-500 text-white shadow-sm">
                  MOST POPULAR
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{p.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 min-h-[32px]">{p.desc}</p>
                </div>

                <div className="flex items-baseline text-slate-800 dark:text-white">
                  <span className="text-4xl font-extrabold tracking-tight">${p.price}</span>
                  <span className="ml-1 text-sm text-slate-400 dark:text-slate-550 font-semibold">/month</span>
                </div>

                <ul className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start text-xs text-slate-650 dark:text-slate-350">
                      <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                {isUserPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs cursor-default flex items-center justify-center space-x-1.5"
                  >
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.name as any)}
                    disabled={upgradingPlan !== null}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                      p.popular
                        ? "bg-gradient-to-r from-brand-600 to-indigo-650 text-white hover:from-brand-550 hover:to-indigo-600 shadow-md shadow-brand-500/10"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {upgradingPlan === p.name ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{p.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
