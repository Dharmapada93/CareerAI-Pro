import { FastifyInstance } from "fastify";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { getAdminStats, updateSubscription } from "../controllers/adminController";

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", adminMiddleware);

  fastify.get("/stats", getAdminStats);
  fastify.put("/subscription", updateSubscription);
}
