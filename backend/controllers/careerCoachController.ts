import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../lib/database";
import { getCache, setCache } from "../lib/redis";
import { dispatchTask } from "../lib/queue";
import { z } from "zod";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

const coachRequestSchema = z.object({
  type: z.enum(["roadmap", "learning-plan", "linkedin-bio", "negotiation", "outreach"]),
  payload: z.any(),
});

export async function handleCoachRequest(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });

    const parsed = coachRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }

    const { type, payload } = parsed.data;
    const userId = request.user.id;

    // 1. Caching Check
    const cacheKey = `coach:${type}:${JSON.stringify(payload)}`;
    const cachedResponse = await getCache(cacheKey);
    if (cachedResponse) {
      console.log(`Cache hit for key ${cacheKey}`);
      return reply.send(JSON.parse(cachedResponse));
    }

    // 2. Dispatch with Queue fallback
    const result = await dispatchTask(`COACH_${type.toUpperCase()}`, { ...payload, userId }, async () => {
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

      const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
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
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId,
          action: "COACH_AI_GENERATION",
          details: `Generated AI career coach content: ${type}`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write coach AI usage log:", logErr);
    }

    return reply.send(result);
  } catch (error: any) {
    console.error("Career Coach API error:", error);
    return reply.status(500).send({ error: error.message || "Internal Server Error" });
  }
}
