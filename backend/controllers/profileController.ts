import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";

export async function getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const userId = request.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    // Fetch quick stats for profile display
    const resumeCount = await prisma.resume.count({
      where: { userId },
    });

    const interviewCount = await prisma.interviewSession.count({
      where: { userId, status: "completed" },
    });
    
    const atsReports = await prisma.aTSReport.findMany({
      where: { userId },
      select: { score: true },
    });

    const highestAts = atsReports.length > 0 ? Math.max(...atsReports.map((r) => r.score)) : 0;

    return reply.send({
      user: userWithoutPassword,
      stats: {
        resumeCount,
        interviewCount,
        highestAts,
      },
    });
  } catch (error: any) {
    console.error("GET profile error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function updateProfile(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { name, subscription } = (request.body || {}) as any;
    const userId = request.user.id;

    const data: any = {};
    if (name) data.name = name;
    if (subscription) data.subscription = subscription;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return reply.send(userWithoutPassword);
  } catch (error: any) {
    console.error("PUT profile error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
