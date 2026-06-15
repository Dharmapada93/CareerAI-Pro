import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { getATSReports, createATSReport } from "../controllers/atsController";

export default async function atsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", getATSReports);
  fastify.post("/", createATSReport);
}
