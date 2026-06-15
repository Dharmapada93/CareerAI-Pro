import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCache, setCache } from "@/lib/redis";
import { dispatchTask } from "@/lib/queue";
import connectToDatabase from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import { z } from "zod";

export const dynamic = "force-dynamic";

const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

const coachRequestSchema = z.object({
  type: z.enum(["roadmap", "learning-plan", "linkedin-bio", "negotiation", "outreach"]),
  payload: z.any(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = coachRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { type, payload } = parsed.data;
    const userId = (session.user as any).id;

    // 1. Caching Check
    const cacheKey = `coach:${type}:${JSON.stringify(payload)}`;
    const cachedResponse = await getCache(cacheKey);
    if (cachedResponse) {
      console.log(`Cache hit for key ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedResponse));
    }

    // 2. Dispatch with Queue fallback
    const result = await dispatchTask(`COACH_${type.toUpperCase()}`, payload, async () => {
      let endpoint = "";
      let reqBody = {};

      if (type === "roadmap") {
        endpoint = "/api/career-roadmap";
        reqBody = { target_role: payload.role, current_skills: payload.skills || [] };
      } else if (type === "learning-plan") {
        endpoint = "/api/learning-plan";
        reqBody = { skill_gap: payload.skillGap || [] };
      } else if (type === "linkedin-bio") {
        endpoint = "/api/linkedin-bio";
        reqBody = { role: payload.role, key_skills: payload.keySkills || [] };
      } else if (type === "negotiation") {
        endpoint = "/api/negotiation-script";
        reqBody = { role: payload.role, offer_details: payload.offerDetails || "" };
      } else if (type === "outreach") {
        endpoint = "/api/job-followup";
        reqBody = { company: payload.company, role: payload.role, context: payload.context || "" };
      }

      const response = await fetch(`${serviceUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Failed fetching AI coach data for type ${type}`);
      }

      return await response.json();
    });

    // 3. Cache response for 1 hour
    await setCache(cacheKey, JSON.stringify(result), 3600);

    // 4. Log audit event
    await connectToDatabase();
    await ActivityLog.create({
      userId,
      action: "COACH_AI_GENERATION",
      details: `Generated AI career coach content: ${type}`,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Career Coach API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
