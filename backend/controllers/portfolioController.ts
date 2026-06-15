import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

export async function getPortfolio(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: request.user.id },
    });
    return reply.send(portfolio || null);
  } catch (error: any) {
    console.error("GET portfolio error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function savePortfolio(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const { slug, theme, content, isPublished, regenerate, personalInfo, skills, projects } = (request.body || {}) as any;

    if (!slug) {
      return reply.status(400).send({ error: "Slug is a required field" });
    }

    const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    // Check slug uniqueness
    const existingSlug = await prisma.portfolio.findFirst({
      where: { slug: cleanedSlug },
    });

    if (existingSlug && existingSlug.userId !== request.user.id) {
      return reply.status(400).send({ error: "Portfolio slug already taken by another user" });
    }

    let finalContent = content;

    // Regenerate or generate with AI if requested
    if (regenerate || !content || !content.heroTitle) {
      if (!personalInfo || !skills || !projects) {
        return reply.status(400).send({
          error: "Details (personalInfo, skills, projects) are required to generate portfolio using AI",
        });
      }

      const response = await fetch(`${AI_SERVICE_URL}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_info: personalInfo,
          skills,
          projects,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return reply.status(response.status).send({ error: errorText || "Failed to generate AI portfolio content" });
      }

      finalContent = await response.json();
    }

    let portfolio = await prisma.portfolio.findFirst({
      where: { userId: request.user.id },
    });

    if (portfolio) {
      portfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          slug: cleanedSlug,
          theme: theme || portfolio.theme,
          content: finalContent || portfolio.content,
          isPublished: isPublished !== undefined ? isPublished : portfolio.isPublished,
        },
      });
    } else {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: request.user.id,
          slug: cleanedSlug,
          theme: theme || "dark",
          content: finalContent || {},
          isPublished: isPublished || false,
        },
      });
    }

    return reply.send(portfolio);
  } catch (error: any) {
    console.error("POST portfolio error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getPublicPortfolioBySlug(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { slug } = request.params as any;
    if (!slug) {
      return reply.status(400).send({ error: "Slug parameter is required" });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!portfolio || !portfolio.isPublished) {
      return reply.status(404).send({ error: "Portfolio not found or is currently private" });
    }

    const user = await prisma.user.findUnique({
      where: { id: portfolio.userId },
      select: { name: true, email: true },
    });

    const resume = await prisma.resume.findFirst({
      where: { userId: portfolio.userId },
      orderBy: { updatedAt: "desc" },
    });

    return reply.send({ portfolio, user, resume });
  } catch (error: any) {
    console.error("GET public portfolio error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
