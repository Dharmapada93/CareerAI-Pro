import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

export async function getATSReports(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const reports = await prisma.aTSReport.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(reports);
  } catch (error: any) {
    console.error("GET ATS reports error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createATSReport(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { resumeText, jobDescription, resumeId } = (request.body || {}) as any;

    if (!resumeText || !jobDescription) {
      return reply.status(400).send({ error: "Resume text and Job description are required" });
    }

    const response = await fetch(`${AI_SERVICE_URL}/api/ats-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return reply.status(response.status).send({ error: errorText || "Failed to analyze ATS score" });
    }

    const analysis = (await response.json()) as any;

    const report = await prisma.aTSReport.create({
      data: {
        userId: request.user.id,
        resumeId: resumeId || null,
        jobDescription,
        score: analysis.score,
        missingKeywords: analysis.missingKeywords || [],
        formattingSuggestions: analysis.formattingSuggestions || [],
        skillGapAnalysis: analysis.skillGapAnalysis || [],
        improvementTips: analysis.improvementTips || [],
      },
    });

    return reply.status(201).send(report);
  } catch (error: any) {
    console.error("POST ATS score checker error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
