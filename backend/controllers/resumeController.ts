import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";
import { rateLimit } from "../lib/rateLimit";
import { getCache, setCache } from "../lib/redis";
import { dispatchTask } from "../lib/queue";
import { z } from "zod";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

// Schemas
const summarySchema = z.object({
  skills: z.array(z.string()),
  experience: z.array(z.string()),
});

const bulletsSchema = z.object({
  role: z.string(),
  bullet_point: z.string(),
});

const grammarSchema = z.object({
  text: z.string().min(1, "Text is required to perform grammar checks"),
});

const toneSchema = z.object({
  text: z.string().min(1, "Text description is required"),
  tone: z.string().min(1, "Wording tone is required"),
});

const achievementsSchema = z.object({
  bullet: z.string().min(1, "Accomplishment description is required"),
});

const tailorSchema = z.object({
  resume_data: z.any(),
  job_description: z.string().min(1, "Job description is required"),
});

export async function getResumes(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const resumes = await prisma.resume.findMany({
      where: { userId: request.user.id },
      orderBy: { updatedAt: "desc" },
    });
    return reply.send(resumes);
  } catch (error: any) {
    console.error("GET resume list error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createResume(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { title, templateId } = (request.body || {}) as any;

    const newResume = await prisma.resume.create({
      data: {
        userId: request.user.id,
        title: title || "My Resume",
        templateId: templateId || "modern",
        personalInfo: {
          name: request.user.name || "",
          email: request.user.email || "",
          phone: "",
          github: "",
          linkedin: "",
          website: "",
          summary: "",
        },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certificates: [],
      },
    });

    return reply.status(201).send(newResume);
  } catch (error: any) {
    console.error("POST resume error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getResumeDetail(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { id } = request.params as any;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!resume) {
      return reply.status(404).send({ error: "Resume not found" });
    }

    return reply.send(resume);
  } catch (error: any) {
    console.error("GET resume detail error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function updateResumeDetail(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { id } = request.params as any;
    const updateBody = request.body as any;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!resume) {
      return reply.status(404).send({ error: "Resume not found" });
    }

    // Clean data fields that shouldn't be overridden in simple update
    delete updateBody.id;
    delete updateBody.userId;
    delete updateBody.createdAt;
    delete updateBody.updatedAt;

    const updated = await prisma.resume.update({
      where: { id },
      data: updateBody,
    });

    return reply.send(updated);
  } catch (error: any) {
    console.error("PUT resume detail error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function deleteResume(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { id } = request.params as any;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!resume) {
      return reply.status(404).send({ error: "Resume not found" });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return reply.send({ message: "Resume deleted successfully" });
  } catch (error: any) {
    console.error("DELETE resume error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

// AI proxy helpers
async function handleAiProxy(
  request: AuthenticatedRequest,
  reply: FastifyReply,
  taskType: string,
  cacheKey: string,
  schema: z.ZodSchema,
  endpoint: string,
  rateLimitConfig: { limit: number; duration: number }
) {
  try {
    const ip = (request.headers["x-forwarded-for"] as string) || request.ip || "127.0.0.1";
    const limiter = await rateLimit(ip, rateLimitConfig.limit, rateLimitConfig.duration);
    if (!limiter.success) {
      return reply.status(429).send({ error: "Rate limit exceeded. Please wait a minute." });
    }

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }

    const cached = await getCache(cacheKey);
    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    const result = await dispatchTask(taskType, parsed.data, async () => {
      const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to execute ${taskType}`);
      }

      return await response.json();
    });

    await setCache(cacheKey, JSON.stringify(result), 3600);
    return reply.send(result);
  } catch (error: any) {
    console.error(`AI Proxy error (${taskType}):`, error);
    return reply.status(500).send({ error: error.message || "Internal Server Error" });
  }
}

export async function aiSummary(request: AuthenticatedRequest, reply: FastifyReply) {
  const cacheKey = `ai:summary:${JSON.stringify(request.body)}`;
  return handleAiProxy(request, reply, "GENERATE_SUMMARY", cacheKey, summarySchema, "/api/resume-summary", { limit: 15, duration: 60 });
}

export async function aiBullets(request: AuthenticatedRequest, reply: FastifyReply) {
  const body = (request.body || {}) as any;
  const cacheKey = `ai:bullets:${body.role}:${body.bullet_point}`;
  return handleAiProxy(request, reply, "GENERATE_BULLETS", cacheKey, bulletsSchema, "/api/resume-bullets", { limit: 15, duration: 60 });
}

export async function aiGrammar(request: AuthenticatedRequest, reply: FastifyReply) {
  const body = (request.body || {}) as any;
  const cacheKey = `ai:grammar:${body.text}`;
  return handleAiProxy(request, reply, "CHECK_GRAMMAR", cacheKey, grammarSchema, "/api/grammar-correction", { limit: 20, duration: 60 });
}

export async function aiTone(request: AuthenticatedRequest, reply: FastifyReply) {
  const body = (request.body || {}) as any;
  const cacheKey = `ai:tone:${body.text}:${body.tone}`;
  return handleAiProxy(request, reply, "CHANGE_TONE", cacheKey, toneSchema, "/api/resume-tone", { limit: 20, duration: 60 });
}

export async function aiAchievements(request: AuthenticatedRequest, reply: FastifyReply) {
  const body = (request.body || {}) as any;
  const cacheKey = `ai:achievements:${body.bullet}`;
  return handleAiProxy(request, reply, "ENHANCE_ACHIEVEMENTS", cacheKey, achievementsSchema, "/api/achievements-rewrite", { limit: 20, duration: 60 });
}

export async function aiTailor(request: AuthenticatedRequest, reply: FastifyReply) {
  const body = (request.body || {}) as any;
  const cacheKey = `ai:tailor:${JSON.stringify(body.resume_data)}:${body.job_description?.substring(0, 100)}`;
  return handleAiProxy(request, reply, "TAILOR_RESUME", cacheKey, tailorSchema, "/api/resume-tailor", { limit: 15, duration: 60 });
}
