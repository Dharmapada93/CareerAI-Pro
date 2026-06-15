import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Resume from "@/models/Resume";
import User from "@/models/User";
import { Link2, Mail, Briefcase, GraduationCap, Code, Globe } from "lucide-react";
import Link from "next/link";

export default async function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  await connectToDatabase();

  const portfolio = await Portfolio.findOne({ slug: slug.toLowerCase() });

  if (!portfolio || !portfolio.isPublished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-dark-600">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Portfolio Offline</h2>
          <p className="text-sm text-slate-550 dark:text-slate-400">
            This developer portfolio is either not configured yet or has not been published by the author.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              Back to CareerAI Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch author details and their latest active resume
  const user = await User.findById(portfolio.userId).select("name email");
  const resume = await Resume.findOne({ userId: portfolio.userId }).sort({ updatedAt: -1 });

  const isDark = portfolio.theme === "dark";

  return (
    <div className={`min-h-screen ${
      isDark ? "bg-[#0b0f19] text-slate-100" : "bg-slate-50 text-slate-900"
    } transition-colors duration-300 font-sans pb-24`}>
      {/* Mini Top Banner */}
      <nav className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md ${
        isDark ? "bg-[#0b0f19]/70 border-white/5" : "bg-white/70 border-slate-200"
      }`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
            {user?.name || "Developer"}
          </span>

          <div className="flex items-center space-x-4">
            {resume?.personalInfo.email && (
              <a href={`mailto:${resume.personalInfo.email}`} className="text-slate-400 hover:text-brand-500 transition">
                <Mail className="w-4.5 h-4.5" />
              </a>
            )}
            {resume?.personalInfo.github && (
              <a href={resume.personalInfo.github} target="_blank" className="text-slate-400 hover:text-brand-500 transition">
                <Globe className="w-4.5 h-4.5" />
              </a>
            )}
            {resume?.personalInfo.linkedin && (
              <a href={resume.personalInfo.linkedin} target="_blank" className="text-slate-400 hover:text-brand-500 transition">
                <Link2 className="w-4.5 h-4.5" />
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-16">
        {/* Hero Section */}
        <div className="space-y-4 text-left relative">
          {/* Glowing element */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {portfolio.content.heroTitle || `Hi, I'm ${user?.name}`}
          </h1>
          <p className={`text-lg sm:text-xl font-medium max-w-2xl ${isDark ? "text-slate-400" : "text-slate-550"}`}>
            {portfolio.content.heroSubtitle || "Software Engineer specializing in dynamic React platforms and scaling APIs."}
          </p>
        </div>

        {/* About Me Section */}
        <div className="space-y-4 text-left">
          <h3 className={`text-xs uppercase font-extrabold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            About Me
          </h3>
          <p className={`text-base leading-relaxed max-w-3xl ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {portfolio.content.aboutMe}
          </p>
        </div>

        {/* Skills Section */}
        {resume?.skills && resume.skills.length > 0 && (
          <div className="space-y-4 text-left">
            <h3 className={`text-xs uppercase font-extrabold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Technical Expertise
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {resume.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                    isDark ? "bg-slate-900/60 border border-slate-800 text-slate-300" : "bg-white border border-slate-150 text-slate-750"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {resume?.projects && resume.projects.length > 0 && (
          <div className="space-y-6 text-left">
            <h3 className={`text-xs uppercase font-extrabold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Featured Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resume.projects.map((proj, pIdx) => {
                const subObj = portfolio.content.projectSubtitles as any;
                const customSubtitle = subObj && typeof subObj.get === "function"
                  ? subObj.get(proj.title)
                  : subObj
                  ? subObj[proj.title]
                  : "";

                return (
                  <div
                    key={pIdx}
                    className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition hover:-translate-y-1 ${
                      isDark ? "bg-slate-900/30 border-slate-850 hover:bg-slate-900/50" : "bg-white border-slate-150 hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold">{proj.title}</h4>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            className="text-brand-500 hover:text-brand-650 transition flex items-center text-xs font-semibold"
                          >
                            <Link2 className="w-4 h-4 mr-0.5" />
                            <span>Link</span>
                          </a>
                        )}
                      </div>
                      <p className={`text-xs font-bold ${isDark ? "text-slate-450" : "text-slate-500"}`}>
                        {customSubtitle || proj.role || "Developer Core"}
                      </p>
                      <p className={`text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        {proj.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline: Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-left">
          {/* Work History */}
          {resume?.experience && resume.experience.length > 0 && (
            <div className="space-y-6">
              <h3 className={`text-xs uppercase font-extrabold tracking-widest flex items-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <Briefcase className="w-4.5 h-4.5 mr-2 text-indigo-500" />
                <span>Work Timeline</span>
              </h3>

              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-6">
                {resume.experience.map((exp, eIdx) => (
                  <div key={eIdx} className="relative">
                    <span className="absolute -left-[20.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-brand-500" />
                    <div>
                      <h4 className="text-sm font-bold">{exp.position}</h4>
                      <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {exp.company}
                      </p>
                      <span className={`text-[10px] block mt-1 ${isDark ? "text-slate-500" : "text-slate-450"}`}>
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education history */}
          {resume?.education && resume.education.length > 0 && (
            <div className="space-y-6">
              <h3 className={`text-xs uppercase font-extrabold tracking-widest flex items-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <GraduationCap className="w-4.5 h-4.5 mr-2 text-brand-500" />
                <span>Education</span>
              </h3>

              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-6">
                {resume.education.map((edu, eduIdx) => (
                  <div key={eduIdx} className="relative">
                    <span className="absolute -left-[20.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500" />
                    <div>
                      <h4 className="text-sm font-bold">{edu.degree}</h4>
                      <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {edu.school} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      </p>
                      <span className={`text-[10px] block mt-1 ${isDark ? "text-slate-500" : "text-slate-450"}`}>
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
