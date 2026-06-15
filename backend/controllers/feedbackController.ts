import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";
import { z } from "zod";

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "feedback"]).default("feedback"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message text is required"),
});

export async function createFeedback(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const parsed = feedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }

    const userId = request.user.id;

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        type: parsed.data.type,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });

    return reply.send({ success: true, feedback });
  } catch (error: any) {
    console.error("POST feedback error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getFeedbacks(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user || request.user.role !== "admin") {
      return reply.status(403).send({ error: "Forbidden. Admin access required." });
    }

    const items = await prisma.feedback.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format output to be similar to populated items if needed
    const formatted = items.map((item) => ({
      id: item.id,
      userId: item.user,
      type: item.type,
      subject: item.subject,
      message: item.message,
      createdAt: item.createdAt,
    }));

    return reply.send(formatted);
  } catch (error: any) {
    console.error("GET feedback error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function deleteFeedback(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user || request.user.role !== "admin") {
      return reply.status(403).send({ error: "Forbidden. Admin access required." });
    }

    const id = (request.params as any).id || ((request.query as any).id as string);
    if (!id) {
      return reply.status(400).send({ error: "Feedback ID is required" });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return reply.status(404).send({ error: "Feedback not found" });
    }

    await prisma.feedback.delete({
      where: { id },
    });

    // Log the change
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: request.user.id,
          action: "ADMIN_FEEDBACK_RESOLVE",
          details: `Resolved and archived feedback item: ${id} from User: ${feedback.userId}`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write admin feedback resolve log:", logErr);
    }

    return reply.send({ success: true, message: "Feedback marked as resolved" });
  } catch (error: any) {
    console.error("DELETE feedback error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
