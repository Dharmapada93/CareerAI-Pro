import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import ATSReport from "@/models/ATSReport";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const reports = await ATSReport.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("GET ATS reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeText, jobDescription, resumeId } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Resume text and Job description are required" }, { status: 400 });
    }

    const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

    const response = await fetch(`${serviceUrl}/api/ats-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed to analyze ATS score" }, { status: response.status });
    }

    const analysis = await response.json();

    await connectToDatabase();
    const report = await ATSReport.create({
      userId: (session.user as any).id,
      resumeId: resumeId || undefined,
      jobDescription,
      score: analysis.score,
      missingKeywords: analysis.missingKeywords || [],
      formattingSuggestions: analysis.formattingSuggestions || [],
      skillGapAnalysis: analysis.skillGapAnalysis || [],
      improvementTips: analysis.improvementTips || [],
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("POST ATS score checker error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
