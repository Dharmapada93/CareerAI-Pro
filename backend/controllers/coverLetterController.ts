import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

export async function getCoverLetters(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(coverLetters);
  } catch (error: any) {
    console.error("GET cover letters error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createCoverLetter(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { companyName, role, skills, experience } = (request.body || {}) as any;

    if (!companyName || !role || !skills || !experience) {
      return reply.status(400).send({ error: "All fields are required" });
    }

    const response = await fetch(`${AI_SERVICE_URL}/api/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: companyName,
        role,
        skills: Array.isArray(skills) ? skills : [skills],
        experience,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return reply.status(response.status).send({ error: errorText || "Failed to generate cover letter" });
    }

    const data = (await response.json()) as any;

    const letter = await prisma.coverLetter.create({
      data: {
        userId: request.user.id,
        companyName,
        role,
        content: data.cover_letter,
      },
    });

    return reply.status(201).send(letter);
  } catch (error: any) {
    console.error("POST cover letter generation error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
