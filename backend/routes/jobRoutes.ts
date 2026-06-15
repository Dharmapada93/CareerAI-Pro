import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { getJobs, createJob, updateJob, deleteJob } from "../controllers/jobController";

export default async function jobRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/", getJobs);
  fastify.post("/", createJob);
  fastify.put("/", updateJob);
  fastify.put("/:id", updateJob);
  fastify.delete("/", deleteJob);
  fastify.delete("/:id", deleteJob);
}
