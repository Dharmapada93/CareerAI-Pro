import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { getPortfolio, savePortfolio, getPublicPortfolioBySlug } from "../controllers/portfolioController";

export default async function portfolioRoutes(fastify: FastifyInstance) {
  // Public route
  fastify.get("/public/:slug", getPublicPortfolioBySlug);

  // Private routes (require auth preHandler)
  fastify.get("/", { preHandler: [authMiddleware] }, getPortfolio);
  fastify.post("/", { preHandler: [authMiddleware] }, savePortfolio);
}
