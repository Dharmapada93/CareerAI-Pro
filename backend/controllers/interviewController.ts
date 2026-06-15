import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

export async function getInterviewSessions(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(sessions);
  } catch (error: any) {
    console.error("GET interview sessions error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createInterviewSession(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { role, experienceLevel } = (request.body || {}) as any;

    if (!role || !experienceLevel) {
      return reply.status(400).send({ error: "Role and Experience Level are required fields" });
    }

    const response = await fetch(`${AI_SERVICE_URL}/api/interview/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, experience_level: experienceLevel }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return reply.status(response.status).send({ error: errorText || "Failed to generate interview questions" });
    }

    const data = (await response.json()) as any;
    const generatedQuestions = data.questions || [];

    const mappedQuestions = generatedQuestions.map((q: string) => ({
      question: q,
      answer: "",
      feedback: "",
      scores: { technical: 0, communication: 0, confidence: 0 },
      improvedAnswer: "",
    }));

    const newSession = await prisma.interviewSession.create({
      data: {
        userId: request.user.id,
        role,
        experienceLevel,
        questions: mappedQuestions,
        status: "pending",
        overallScores: { technical: 0, communication: 0, confidence: 0 },
        overallFeedback: "",
      },
    });

    return reply.status(201).send(newSession);
  } catch (error: any) {
    console.error("POST start interview session error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getInterviewSessionDetail(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { id } = request.params as any;
    const dbSession = await prisma.interviewSession.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!dbSession) {
      return reply.status(404).send({ error: "Interview session not found" });
    }

    return reply.send(dbSession);
  } catch (error: any) {
    console.error("GET interview session detail error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function updateInterviewSessionAnswer(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { id } = request.params as any;
    const { questionIndex, userAnswer } = (request.body || {}) as any;

    if (questionIndex === undefined || userAnswer === undefined) {
      return reply.status(400).send({ error: "Question index and User answer are required fields" });
    }

    const dbSession = await prisma.interviewSession.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!dbSession) {
      return reply.status(404).send({ error: "Interview session not found" });
    }

    const questionsList = (dbSession.questions || []) as any[];

    if (questionIndex < 0 || questionIndex >= questionsList.length) {
      return reply.status(400).send({ error: "Invalid question index" });
    }

    const questionText = questionsList[questionIndex].question;

    const response = await fetch(`${AI_SERVICE_URL}/api/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: questionText,
        user_answer: userAnswer,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return reply.status(response.status).send({ error: errorText || "Failed to evaluate answer" });
    }

    const evalResult = (await response.json()) as any;

    // Update specific question index
    questionsList[questionIndex].answer = userAnswer;
    questionsList[questionIndex].feedback = evalResult.feedback;
    questionsList[questionIndex].improvedAnswer = evalResult.improvedAnswer;
    questionsList[questionIndex].scores = {
      technical: evalResult.technical || 0,
      communication: evalResult.communication || 0,
      confidence: evalResult.confidence || 0,
    };

    let overallFeedback = dbSession.overallFeedback || "";
    let overallScores = dbSession.overallScores as any;
    let status = dbSession.status;

    // Check if session is completed
    const allAnswered = questionsList.every((q) => q.answer && q.answer.trim().length > 0);
    if (allAnswered) {
      status = "completed";

      let techSum = 0;
      let commSum = 0;
      let confSum = 0;

      questionsList.forEach((q) => {
        techSum += q.scores?.technical || 0;
        commSum += q.scores?.communication || 0;
        confSum += q.scores?.confidence || 0;
      });

      const qCount = questionsList.length;
      overallScores = {
        technical: Math.round(techSum / qCount),
        communication: Math.round(commSum / qCount),
        confidence: Math.round(confSum / qCount),
      };

      const average = Math.round((techSum + commSum + confSum) / (qCount * 3));
      overallFeedback = `You have completed the AI mock interview session for the role of ${dbSession.role}. Your overall average performance score is ${average}%. ${
        average >= 80
          ? "Outstanding performance! You displayed exceptional technical depth and clear articulation."
          : average >= 65
          ? "Good performance with minor areas of growth. We recommend reviewing the suggested answer templates for sections scoring below 75%."
          : "Solid base but could benefit from structured interview preparation. Focus on using active verbs, detailing structural steps, and defining industry terminology."
      }`;
    }

    const updatedSession = await prisma.interviewSession.update({
      where: { id },
      data: {
        questions: questionsList,
        status,
        overallScores,
        overallFeedback,
      },
    });

    return reply.send(updatedSession);
  } catch (error: any) {
    console.error("PUT interview evaluation error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
