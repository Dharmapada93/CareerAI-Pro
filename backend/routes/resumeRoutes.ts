import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import {
  getResumes,
  createResume,
  getResumeDetail,
  updateResumeDetail,
  deleteResume,
  aiSummary,
  aiBullets,
  aiGrammar,
  aiTone,
  aiAchievements,
  aiTailor,
} from "../controllers/resumeController";

export default async function resumeRoutes(fastify: FastifyInstance) {
  // Add authentication preHandler for all resume paths
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", getResumes);
  fastify.post("/", createResume);
  fastify.get("/:id", getResumeDetail);
  fastify.put("/:id", updateResumeDetail);
  fastify.delete("/:id", deleteResume);

  // AI helper endpoints
  fastify.post("/ai-summary", aiSummary);
  fastify.post("/ai-bullets", aiBullets);
  fastify.post("/ai-grammar", aiGrammar);
  fastify.post("/ai-tone", aiTone);
  fastify.post("/ai-achievements", aiAchievements);
  fastify.post("/ai-tailor", aiTailor);
}
