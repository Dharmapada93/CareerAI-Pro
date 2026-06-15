import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const dbSession = await InterviewSession.findOne({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    return NextResponse.json(dbSession);
  } catch (error: any) {
    console.error("GET interview session detail error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { questionIndex, userAnswer } = await req.json();

    if (questionIndex === undefined || userAnswer === undefined) {
      return NextResponse.json({ error: "Question index and User answer are required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const dbSession = await InterviewSession.findOne({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    if (questionIndex < 0 || questionIndex >= dbSession.questions.length) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 });
    }

    const questionText = dbSession.questions[questionIndex].question;

    // Contact FastAPI for evaluation
    const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";
    const response = await fetch(`${serviceUrl}/api/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: questionText,
        user_answer: userAnswer,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed to evaluate answer" }, { status: response.status });
    }

    const evalResult = await response.json();

    // Update specific question index
    dbSession.questions[questionIndex].answer = userAnswer;
    dbSession.questions[questionIndex].feedback = evalResult.feedback;
    dbSession.questions[questionIndex].improvedAnswer = evalResult.improvedAnswer;
    dbSession.questions[questionIndex].scores = {
      technical: evalResult.technical || 0,
      communication: evalResult.communication || 0,
      confidence: evalResult.confidence || 0,
    };

    // Check if session is completed (i.e. all questions have an answer)
    const allAnswered = dbSession.questions.every((q) => q.answer && q.answer.trim().length > 0);
    if (allAnswered) {
      dbSession.status = "completed";

      // Calculate averages
      let techSum = 0;
      let commSum = 0;
      let confSum = 0;

      dbSession.questions.forEach((q) => {
        techSum += q.scores?.technical || 0;
        commSum += q.scores?.communication || 0;
        confSum += q.scores?.confidence || 0;
      });

      const qCount = dbSession.questions.length;
      dbSession.overallScores = {
        technical: Math.round(techSum / qCount),
        communication: Math.round(commSum / qCount),
        confidence: Math.round(confSum / qCount),
      };

      const average = Math.round((techSum + commSum + confSum) / (qCount * 3));
      dbSession.overallFeedback = `You have completed the AI mock interview session for the role of ${dbSession.role}. Your overall average performance score is ${average}%. ${
        average >= 80
          ? "Outstanding performance! You displayed exceptional technical depth and clear articulation."
          : average >= 65
          ? "Good performance with minor areas of growth. We recommend reviewing the suggested answer templates for sections scoring below 75%."
          : "Solid base but could benefit from structured interview preparation. Focus on using active verbs, detailing structural steps, and defining industry terminology."
      }`;
    }

    await dbSession.save();
    return NextResponse.json(dbSession);
  } catch (error: any) {
    console.error("PUT interview evaluation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
