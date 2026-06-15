import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { getCoverLetters, createCoverLetter } from "../controllers/coverLetterController";

export default async function coverLetterRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", getCoverLetters);
  fastify.post("/", createCoverLetter);
}
