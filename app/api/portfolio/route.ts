import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const portfolio = await Portfolio.findOne({ userId: (session.user as any).id });

    return NextResponse.json(portfolio || null);
  } catch (error: any) {
    console.error("GET portfolio error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, theme, content, isPublished, regenerate, personalInfo, skills, projects } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is a required field" }, { status: 400 });
    }

    const cleanedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    await connectToDatabase();

    // Check slug uniqueness
    const existingSlug = await Portfolio.findOne({ slug: cleanedSlug });
    if (existingSlug && existingSlug.userId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Portfolio slug already taken by another user" }, { status: 400 });
    }

    let finalContent = content;

    // Regenerate or generate with AI if requested
    if (regenerate || !content || !content.heroTitle) {
      if (!personalInfo || !skills || !projects) {
        return NextResponse.json({ error: "Details (personalInfo, skills, projects) are required to generate portfolio using AI" }, { status: 400 });
      }

      const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";
      const response = await fetch(`${serviceUrl}/api/portfolio`, {
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
        return NextResponse.json({ error: errorText || "Failed to generate AI portfolio content" }, { status: response.status });
      }

      finalContent = await response.json();
    }

    let portfolio = await Portfolio.findOne({ userId: (session.user as any).id });

    if (portfolio) {
      portfolio.slug = cleanedSlug;
      portfolio.theme = theme || portfolio.theme;
      portfolio.content = finalContent || portfolio.content;
      portfolio.isPublished = isPublished !== undefined ? isPublished : portfolio.isPublished;
      await portfolio.save();
    } else {
      portfolio = await Portfolio.create({
        userId: (session.user as any).id,
        slug: cleanedSlug,
        theme: theme || "dark",
        content: finalContent,
        isPublished: isPublished || false,
      });
    }

    return NextResponse.json(portfolio);
  } catch (error: any) {
    console.error("POST portfolio error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
