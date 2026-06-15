import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { getProfile, updateProfile } from "../controllers/profileController";

export default async function profileRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", getProfile);
  fastify.put("/", updateProfile);
}
