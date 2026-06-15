import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  status: z.enum(["Applied", "Interview", "Selected", "Rejected"]).default("Applied"),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
  checklist: z.array(z.object({ text: z.string(), completed: z.boolean() })).optional(),
});

export async function getJobs(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const userId = request.user.id;
    const jobs = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(jobs);
  } catch (error: any) {
    console.error("GET jobs error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function createJob(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const parsed = jobSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }

    const userId = request.user.id;

    const job = await prisma.jobApplication.create({
      data: {
        userId,
        title: parsed.data.title,
        company: parsed.data.company,
        status: parsed.data.status,
        appliedDate: parsed.data.appliedDate ? new Date(parsed.data.appliedDate) : new Date(),
        notes: parsed.data.notes || "",
        checklist: parsed.data.checklist || [],
        reminders: [],
        emails: [],
      },
    });

    try {
      await prisma.aIUsageLog.create({
        data: {
          userId,
          action: "JOB_TRACKED_ADD",
          details: `Tracked new job application: ${parsed.data.title} at ${parsed.data.company}`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write job tracked add log:", logErr);
    }

    return reply.send(job);
  } catch (error: any) {
    console.error("POST jobs error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function updateJob(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const body = (request.body || {}) as any;
    const id = (request.params as any).id || body.id;
    const { id: _, ...updateData } = body;

    if (!id) {
      return reply.status(400).send({ error: "Job ID is required" });
    }

    const userId = request.user.id;

    const jobExists = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!jobExists) {
      return reply.status(404).send({ error: "Job not found or unauthorized" });
    }

    if (updateData.appliedDate) {
      updateData.appliedDate = new Date(updateData.appliedDate);
    }

    const job = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
    });

    return reply.send(job);
  } catch (error: any) {
    console.error("PUT jobs error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function deleteJob(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const id = (request.params as any).id || ((request.query as any).id as string);

    if (!id) {
      return reply.status(400).send({ error: "Job ID is required" });
    }

    const userId = request.user.id;

    const job = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!job) {
      return reply.status(404).send({ error: "Job not found or unauthorized" });
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    try {
      await prisma.aIUsageLog.create({
        data: {
          userId,
          action: "JOB_TRACKED_DELETE",
          details: `Deleted tracked job application for: ${job.title} at ${job.company}`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write job tracked delete log:", logErr);
    }

    return reply.send({ success: true, message: "Job application deleted" });
  } catch (error: any) {
    console.error("DELETE jobs error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
