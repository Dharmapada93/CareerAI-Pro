import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const sessions = await InterviewSession.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error("GET interview sessions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, experienceLevel } = await req.json();

    if (!role || !experienceLevel) {
      return NextResponse.json({ error: "Role and Experience Level are required fields" }, { status: 400 });
    }

    const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

    const response = await fetch(`${serviceUrl}/api/interview/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, experience_level: experienceLevel }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed to generate interview questions" }, { status: response.status });
    }

    const data = await response.json();
    const generatedQuestions = data.questions || [];

    const mappedQuestions = generatedQuestions.map((q: string) => ({
      question: q,
      answer: "",
      feedback: "",
      scores: { technical: 0, communication: 0, confidence: 0 },
      improvedAnswer: "",
    }));

    await connectToDatabase();
    const newSession = await InterviewSession.create({
      userId: (session.user as any).id,
      role,
      experienceLevel,
      questions: mappedQuestions,
      status: "pending",
      overallScores: { technical: 0, communication: 0, confidence: 0 },
      overallFeedback: "",
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    console.error("POST start interview session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
