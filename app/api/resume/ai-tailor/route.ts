import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { getCache, setCache } from "@/lib/redis";
import { dispatchTask } from "@/lib/queue";
import { z } from "zod";

export const dynamic = "force-dynamic";

const tailorSchema = z.object({
  resume_data: z.any(),
  job_description: z.string().min(1, "Job description is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = await rateLimit(ip, 15, 60);
    if (!limiter.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = tailorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { resume_data, job_description } = parsed.data;
    const cacheKey = `ai:tailor:${JSON.stringify(resume_data)}:${job_description.substring(0, 100)}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

    const result = await dispatchTask("TAILOR_RESUME", { resume_data, job_description }, async () => {
      const response = await fetch(`${serviceUrl}/api/resume-tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_data, job_description }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to tailor resume");
      }

      return await response.json();
    });

    await setCache(cacheKey, JSON.stringify(result), 3600);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Tailor route error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
