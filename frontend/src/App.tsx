import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { PremiumNavbar } from "./components/layout/PremiumNavbar";
import { Sidebar } from "./components/layout/Sidebar";
import { Footer } from "./components/layout/Footer";
import { ThreeDBackground } from "./components/layout/ThreeDBackground";
import { AssistantOrb } from "./components/dashboard/AssistantOrb";

// Lazy Pages
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const ResumeBuilder = React.lazy(() => import("./pages/ResumeBuilder"));
const ResumeEditor = React.lazy(() => import("./pages/ResumeEditor"));
const ATSAnalyzer = React.lazy(() => import("./pages/ATSAnalyzer"));
const MockInterview = React.lazy(() => import("./pages/MockInterview"));
const CareerCoach = React.lazy(() => import("./pages/CareerCoach"));
const JobTracker = React.lazy(() => import("./pages/JobTracker"));
const CoverLetter = React.lazy(() => import("./pages/CoverLetter"));
const PortfolioBuilder = React.lazy(() => import("./pages/PortfolioBuilder"));
const PublicPortfolio = React.lazy(() => import("./pages/PublicPortfolio"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Settings = React.lazy(() => import("./pages/Settings"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));

// Route Guard: Protected Routes
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Route Guard: Admin Routes
function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

// Dashboard Layout wrapper
function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PremiumNavbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 md:pl-64 p-6 min-h-[calc(100vh-4rem)] bg-slate-50/40 dark:bg-dark-600/10 z-10 relative">
          <Outlet />
        </main>
      </div>
      <AssistantOrb />
    </div>
  );
}

// Main Layout (Home, Pricing, Login, Register)
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <PremiumNavbar />
      <div className="flex-grow pt-16 z-10 relative">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  const { checkAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <ThreeDBackground />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        }
      >
        <Routes>
          {/* Main Layout routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
          </Route>

          {/* Protected Dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/resume" element={<ResumeBuilder />} />
              <Route path="/dashboard/resume/:id" element={<ResumeEditor />} />
              <Route path="/dashboard/ats" element={<ATSAnalyzer />} />
              <Route path="/dashboard/interview" element={<MockInterview />} />
              <Route path="/dashboard/interview/:id" element={<MockInterview />} />
              <Route path="/dashboard/career-coach" element={<CareerCoach />} />
              <Route path="/dashboard/job-tracker" element={<JobTracker />} />
              <Route path="/dashboard/cover-letter" element={<CoverLetter />} />
              <Route path="/dashboard/portfolio" element={<PortfolioBuilder />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>

            {/* Admin console routes */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
