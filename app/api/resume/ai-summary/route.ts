import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { getCache, setCache } from "@/lib/redis";
import { dispatchTask } from "@/lib/queue";
import { z } from "zod";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  skills: z.array(z.string()),
  experience: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = await rateLimit(ip, 15, 60); // 15 requests/min limit for AI tasks
    if (!limiter.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { skills, experience } = parsed.data;
    const cacheKey = `ai:summary:${JSON.stringify({ skills, experience })}`;
    
    // Caching
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

    const result = await dispatchTask("GENERATE_SUMMARY", { skills, experience }, async () => {
      const response = await fetch(`${serviceUrl}/api/resume-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, experience }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate summary");
      }

      return await response.json();
    });

    await setCache(cacheKey, JSON.stringify(result), 3600);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Summary generation route error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
