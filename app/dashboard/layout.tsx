import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AssistantOrb } from "@/components/dashboard/AssistantOrb";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-dark-600/30">
      <div className="flex flex-1 pt-1">
        <Sidebar />
        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 min-w-0 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <AssistantOrb />
    </div>
  );
}
