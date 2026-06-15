import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { createFeedback, getFeedbacks, deleteFeedback } from "../controllers/feedbackController";

export default async function feedbackRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post("/", createFeedback);
  fastify.get("/", getFeedbacks);
  fastify.delete("/", deleteFeedback);
  fastify.delete("/:id", deleteFeedback);
}
