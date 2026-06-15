import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";
import { z } from "zod";

const subscriptionUpdateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  subscription: z.enum(["Free", "Pro", "Enterprise"]),
});

export async function getAdminStats(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user || request.user.role !== "admin") {
      return reply.status(403).send({ error: "Forbidden. Admin privileges required." });
    }

    const totalUsers = await prisma.user.count();
    const totalResumes = await prisma.resume.count();
    const totalInterviews = await prisma.interviewSession.count();
    const totalATS = await prisma.aTSReport.count();
    const totalCoverLetters = await prisma.coverLetter.count();

    // Subscription counts
    const freeUsers = await prisma.user.count({ where: { subscription: "Free" } });
    const proUsers = await prisma.user.count({ where: { subscription: "Pro" } });
    const enterpriseUsers = await prisma.user.count({ where: { subscription: "Enterprise" } });

    // Fetch lists
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscription: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const feedback = await prisma.feedback.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const logs = await prisma.aIUsageLog.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Remap user objects to match mongoose populated properties where key was "userId"
    const formattedFeedback = feedback.map((fb) => ({
      id: fb.id,
      userId: fb.user,
      type: fb.type,
      subject: fb.subject,
      message: fb.message,
      createdAt: fb.createdAt,
    }));

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      userId: log.user,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }));

    return reply.send({
      counts: {
        users: totalUsers,
        resumes: totalResumes,
        interviews: totalInterviews,
        atsReports: totalATS,
        coverLetters: totalCoverLetters,
      },
      subscriptions: {
        Free: freeUsers,
        Pro: proUsers,
        Enterprise: enterpriseUsers,
      },
      users,
      feedback: formattedFeedback,
      logs: formattedLogs,
    });
  } catch (error: any) {
    console.error("GET admin stats error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function updateSubscription(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user || request.user.role !== "admin") {
      return reply.status(403).send({ error: "Forbidden. Admin privileges required." });
    }

    const parsed = subscriptionUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }

    const { userId, subscription } = parsed.data;

    // Prevent updating oneself
    if (userId === request.user.id) {
      return reply.status(400).send({ error: "Cannot modify your own subscription tier" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return reply.status(404).send({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { subscription },
    });

    // Log the change
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: request.user.id,
          action: "ADMIN_USER_TIER_UPDATE",
          details: `Updated subscription for ${updatedUser.email} (${updatedUser.name}) to ${subscription}`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write admin user tier update log:", logErr);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return reply.send(userWithoutPassword);
  } catch (error: any) {
    console.error("PUT subscription update error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
