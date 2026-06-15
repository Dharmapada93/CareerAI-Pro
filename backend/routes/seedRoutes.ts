import { FastifyInstance } from "fastify";
import { seedDatabase } from "../controllers/seedController";

export default async function seedRoutes(fastify: FastifyInstance) {
  fastify.get("/", seedDatabase);
}
