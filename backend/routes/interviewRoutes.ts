import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import {
  getInterviewSessions,
  createInterviewSession,
  getInterviewSessionDetail,
  updateInterviewSessionAnswer,
} from "../controllers/interviewController";

export default async function interviewRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", getInterviewSessions);
  fastify.post("/", createInterviewSession);
  fastify.get("/:id", getInterviewSessionDetail);
  fastify.put("/:id", updateInterviewSessionAnswer);
}
