import { FastifyInstance } from "fastify";
import { register, login, getProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", register);
  fastify.post("/login", login);
  fastify.get("/profile", { preHandler: [authMiddleware] }, getProfile);
}
