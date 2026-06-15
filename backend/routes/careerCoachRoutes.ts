import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { handleCoachRequest } from "../controllers/careerCoachController";

export default async function careerCoachRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post("/", handleCoachRequest);
}
