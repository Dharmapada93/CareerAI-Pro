"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Sparkles,
  Link2,
  Globe,
  Loader2,
  Check,
  Eye,
  Edit3,
  ExternalLink,
  Save,
  AlertCircle,
  Copy,
  Download,
  Archive,
} from "lucide-react";
import JSZip from "jszip";

interface PortfolioContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutMe: string;
  projectSubtitles: Record<string, string>;
}

interface PortfolioData {
  _id: string;
  slug: string;
  theme: string;
  isPublished: boolean;
  content: PortfolioContent;
}

export default function PortfolioDashboardPage() {
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState("dark");
  const [isPublished, setIsPublished] = useState(false);
  const [content, setContent] = useState<PortfolioContent>({
    heroTitle: "",
    heroSubtitle: "",
    aboutMe: "",
    projectSubtitles: {},
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  // Resume details for AI helper
  const [hasResumes, setHasResumes] = useState(false);
  const [resumesList, setResumesList] = useState<any[]>([]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSlug(data.slug);
          setTheme(data.theme);
          setIsPublished(data.isPublished);
          setContent(data.content);
        }
      }

      // Fetch user's resumes to supply the AI builder
      const resumeRes = await fetch("/api/resume");
      if (resumeRes.ok) {
        const resumeData = await resumeRes.json();
        setResumesList(resumeData);
        setHasResumes(resumeData.length > 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError("Please specify a public slug URL.");
      return;
    }

    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          theme,
          content,
          isPublished,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update portfolio");
      } else {
        setSuccess("Portfolio updated successfully!");
        setSlug(data.slug);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the database. Try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!hasResumes) {
      alert("You need to create at least one resume first so we can import your projects and skills!");
      return;
    }

    setError("");
    setSuccess("");
    setAiLoading(true);

    // Grab the latest resume
    const sourceResume = resumesList[0];
    const personalInfo = sourceResume.personalInfo;
    const skills = sourceResume.skills;
    const projects = sourceResume.projects;

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug || personalInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          theme,
          isPublished,
          regenerate: true,
          personalInfo,
          skills,
          projects,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate AI portfolio");
      } else {
        setSuccess("AI Portfolio content compiled successfully!");
        setSlug(data.slug);
        setContent(data.content);
      }
    } catch (err) {
      console.error(err);
      setError("AI Generation failed. Check backend connectivity.");
    } finally {
      setAiLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/portfolio/${slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [exportTheme, setExportTheme] = useState("dark");
  const [zipLoading, setZipLoading] = useState(false);

  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      const zip = new JSZip();

      // Retrieve resume contents for skills/projects
      const resume = resumesList[0] || {};
      const skills = resume.skills || ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Node.js"];
      const projects = resume.projects || [
        { title: "Project Alpha", description: "Full-stack SaaS application built using React.", url: "https://github.com" },
        { title: "Project Beta", description: "High performance microservice optimized with Redis.", url: "https://github.com" }
      ];

      // index.html code structure
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${content.heroTitle || "Developer Portfolio"}</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet">
</head>
<body class="template-\${exportTheme}">
  <div class="glow-bg"></div>
  <header>
    <div class="container">
      <div class="nav">
        <span class="logo">&lt;Developer /&gt;</span>
        <span class="badge">Available for Hire</span>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <h1 class="title">\${content.heroTitle || "Hi, I'm Developer"}</h1>
      <p class="subtitle">\${content.heroSubtitle || "Building premium web applications."}</p>
    </section>

    <section class="about">
      <h2>About Me</h2>
      <p>\${content.aboutMe || "Dedicated software engineer passionate about modern architectures and web performance."}</p>
    </section>

    <section class="skills">
      <h2>Technical Stack</h2>
      <div class="skills-grid">
        \${skills.map(s => \`<span class="skill-tag">\${s}</span>\`).join("\\n        ")}
      </div>
    </section>

    <section class="projects">
      <h2>Featured Projects</h2>
      <div class="projects-grid">
        \${projects.map(p => \`
        <div class="project-card">
          <div class="project-header">
            <h3>\${p.title}</h3>
            \${p.url ? \`<a href="\${p.url}" target="_blank" class="proj-link">View project &rarr;</a>\` : ''}
          </div>
          <p>\${content.projectSubtitles?.[p.title] || p.description || "Accomplishment built matching top industry engineering standards."}</p>
        </div>
        \`).join("")}
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; \${new Date().getFullYear()} \${content.heroTitle ? content.heroTitle.replace("Hi, I'm ", "") : "Developer"}. Powered by CareerAI Pro.</p>
    </div>
  </footer>
</body>
</html>`;

      // style.css styles matching exportTheme choice
      let cssContent = `/* Reset & Base styles */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; line-height: 1.6; }
.container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
header { padding: 32px 0; }
.nav { display: flex; justify-content: space-between; align-items: center; }
.logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
.badge { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
.hero { padding: 80px 0 60px 0; }
.title { font-size: 48px; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 16px; }
.subtitle { font-size: 18px; font-weight: 600; opacity: 0.8; }
.about { padding: 40px 0; }
.about h2, .skills h2, .projects h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; }
.about p { font-size: 15px; line-height: 1.7; }
.skills { padding: 40px 0; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; }
.projects { padding: 60px 0 100px 0; }
.projects-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 600px) { .projects-grid { grid-template-columns: 1fr 1fr; } }
.project-card { padding: 28px; border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; }
.project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.project-card h3 { font-size: 16px; font-weight: 800; }
.proj-link { font-size: 11px; font-weight: 700; text-decoration: none; }
.project-card p { font-size: 12px; opacity: 0.8; line-height: 1.5; }
footer { padding: 60px 0; border-top: 1px solid; font-size: 11px; font-weight: 600; opacity: 0.5; }
`;

      if (exportTheme === "dark") {
        cssContent += `
/* Dark Accent Theme styling */
body { background: #0c0f17; color: #f3f4f6; }
.logo { color: #f3f4f6; }
.badge { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.title { color: #ffffff; text-shadow: 0 0 40px rgba(99, 102, 241, 0.2); }
.subtitle { color: #9ca3af; }
.about h2, .skills h2, .projects h2 { color: #818cf8; }
.about p { color: #d1d5db; }
.skill-tag { background: rgba(255, 255, 255, 0.05); color: #e5e7eb; border: 1px solid rgba(255, 255, 255, 0.08); }
.project-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); }
.project-card:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.02); }
.project-card h3 { color: #ffffff; }
.proj-link { color: #818cf8; }
footer { border-color: rgba(255, 255, 255, 0.05); }
`;
      } else if (exportTheme === "light") {
        cssContent += `
/* Minimalist Serif Light Theme styling */
body { background: #fcfcfc; color: #1f2937; }
.logo { color: #111827; }
.badge { background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; }
.title { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 400; color: #111827; }
.subtitle { color: #4b5563; font-weight: 400; }
.about h2, .skills h2, .projects h2 { color: #9ca3af; }
.about p { color: #374151; font-family: Georgia, serif; font-size: 16px; }
.skill-tag { background: #ffffff; color: #374151; border: 1px solid #e5e7eb; }
.project-card { background: #ffffff; border: 1px solid #e5e7eb; }
.project-card:hover { border-color: #111827; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
.project-card h3 { color: #111827; }
.proj-link { color: #111827; border-bottom: 1px solid; }
footer { border-color: #e5e7eb; }
`;
      } else if (exportTheme === "gradient") {
        cssContent += `
/* Creative Gradient Theme styling */
body { background: linear-gradient(180deg, #0f0c1b 0%, #05020c 100%); color: #f1ecf9; min-height: 100vh; }
.logo { color: #ffffff; }
.badge { background: linear-gradient(90deg, #ec4899, #8b5cf6); color: #ffffff; }
.title { background: linear-gradient(95deg, #f472b6, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { color: #c0b3d6; }
.about h2, .skills h2, .projects h2 { color: #f472b6; }
.about p { color: #d6cae8; }
.skill-tag { background: rgba(139, 92, 246, 0.15); color: #d6cae8; border: 1px solid rgba(139, 92, 246, 0.25); }
.project-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); }
.project-card:hover { transform: translateY(-4px); border-color: #f472b6; background: rgba(244, 72, 153, 0.03); }
.project-card h3 { color: #ffffff; }
.proj-link { color: #f472b6; }
footer { border-color: rgba(255, 255, 255, 0.05); }
`;
      }

      const readmeContent = `# \${content.heroTitle ? content.heroTitle.replace("Hi, I'm ", "") : "Developer"} - Portfolio

This is a premium, responsive static portfolio website exported from CareerAI Pro.

## Project Structure
- \`index.html\` - The HTML structure containing hero headers, skills tags, and your projects list.
- \`style.css\` - Self-contained custom design stylesheet mapping the selected visual theme.

## Run Locally
Double-click \`index.html\` or run a local HTTP server:
\`\`\`bash
npx serve .
\`\`\`

## Deployment in Seconds
Deploy for free to Vercel or Netlify:
1. Initialize a Git repository in this folder.
2. Push to GitHub.
3. Import to Vercel/Netlify as a static site project.
`;

      zip.file("index.html", htmlContent);
      zip.file("style.css", cssContent);
      zip.file("README.md", readmeContent);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `\${slug || "portfolio"}-static.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setZipLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[75vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="relative z-10 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center space-x-2">
          <FolderKanban className="w-8 h-8 text-brand-500" />
          <span>Portfolio Builder</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Expose a public developer portfolio compiled directly from your AI Resumes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO COLUMNS: PORTFOLIO SETTINGS & EDITING */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/40">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                <Globe className="w-4.5 h-4.5 mr-2 text-brand-500" />
                <span>Hosting Configuration</span>
              </h3>

              {slug && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/portfolio/${slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center"
                  >
                    <span>View Site</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <button
                    onClick={copyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-2">
                    Public URL Path Slug
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-800/40 rounded-l-2xl border-r border-slate-250/20 pr-2.5">
                      /portfolio/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                      placeholder="john-doe"
                      className="w-full pl-28 pr-4 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-5">
                  <div className="flex items-center space-x-2">
                    <input
                      id="publish-toggle"
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-slate-300 text-brand-650 focus:ring-brand-500"
                    />
                    <label htmlFor="publish-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      Publish Publicly
                    </label>
                  </div>

                  <div>
                    <label className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-350">
                      <span>Theme:</span>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-250/25 rounded-lg text-xs font-semibold"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* AI Content Setup Trigger */}
              <div className="p-5 rounded-2xl bg-brand-500/[0.03] border border-brand-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold text-brand-650 dark:text-brand-400 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span>AI Portfolio Generator</span>
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal max-w-md">
                    Import skills, achievements, and descriptions from your active resume to generate premium headers and project taglines automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center space-x-1 whitespace-nowrap"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                      <span>Compile AI Page</span>
                    </>
                  )}
                </button>
              </div>

              {/* Form details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <Edit3 className="w-4 h-4 mr-1.5 text-slate-400" />
                  <span>Manual Editing Content</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Hero Landing Title
                  </label>
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    placeholder="e.g. Hi, I'm Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={content.heroSubtitle}
                    onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white"
                    placeholder="e.g. Building premium web apps and responsive user interfaces."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    About Me Paragraph
                  </label>
                  <textarea
                    rows={5}
                    value={content.aboutMe}
                    onChange={(e) => setContent({ ...content, aboutMe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 glass-input text-xs text-slate-900 dark:text-white leading-relaxed"
                    placeholder="Write a descriptive introduction to display on your landing profile..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-75"
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK PREVIEW CARD */}
        <div className="glass-panel p-6 rounded-3xl text-left">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center">
            <Eye className="w-4 h-4 mr-2 text-slate-400" />
            <span>Profile Preview</span>
          </h3>

          {!content.heroTitle ? (
            <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-12">
              Compile or fill out settings to preview profile card structure.
            </p>
          ) : (
            <div className={`p-5 rounded-2xl border text-left space-y-4 ${
              theme === "dark" ? "bg-slate-950 text-white border-slate-850" : "bg-white text-slate-800 border-slate-150"
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-450">Public Portfolio</span>
                <span className={`w-2.5 h-2.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-extrabold tracking-tight">{content.heroTitle}</h4>
                <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  {content.heroSubtitle}
                </p>
              </div>

              <p className={`text-[11px] leading-relaxed line-clamp-4 ${theme === "dark" ? "text-slate-350" : "text-slate-600"}`}>
                {content.aboutMe}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-805 flex justify-end">
                <span className="text-[10px] font-bold text-indigo-500 flex items-center">
                  <span>/portfolio/{slug || "slug"}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN CONTINUED: EXPORT ZIP CARD */}
        <div className="glass-panel p-6 rounded-3xl text-left space-y-4">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center">
            <Archive className="w-4.5 h-4.5 mr-2 text-slate-400" />
            <span>Export Static Site Bundle</span>
          </h3>
          <p className="text-[11px] leading-relaxed text-slate-450 dark:text-slate-500 font-medium">
            Download your portfolio as a fully self-contained HTML/CSS ZIP package ready to deploy to Netlify, Vercel, or GitHub pages.
          </p>

          <div className="space-y-3 pt-2">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Choose Design Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "dark", name: "Dark Grid" },
                { id: "light", name: "Classic Serif" },
                { id: "gradient", name: "Creative" }
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setExportTheme(style.id)}
                  className={`text-[10px] font-bold py-2 rounded-xl border text-center transition capitalize ${
                    exportTheme === style.id
                      ? "bg-slate-900 border-transparent text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-105 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-200"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={zipLoading || !content.heroTitle}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition disabled:opacity-50"
          >
            {zipLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download HTML ZIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
