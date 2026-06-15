import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cors from "@fastify/cors";
import prisma from "./lib/database";

// Import routes
import authRoutes from "./routes/authRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import atsRoutes from "./routes/atsRoutes";
import careerCoachRoutes from "./routes/careerCoachRoutes";
import coverLetterRoutes from "./routes/coverLetterRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import jobRoutes from "./routes/jobRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import profileRoutes from "./routes/profileRoutes";
import seedRoutes from "./routes/seedRoutes";
import adminRoutes from "./routes/adminRoutes";

// Ensure Redis initiates connections on file load
import "./lib/redis";

const fastify = Fastify({
  logger: process.env.NODE_ENV === "development" ? true : false,
});

const PORT = parseInt(process.env.PORT || "5000", 10);

// Setup CORS
fastify.register(cors, {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
});

// Mount routes
fastify.register(authRoutes, { prefix: "/api/auth" });
fastify.register(resumeRoutes, { prefix: "/api/resume" });
fastify.register(atsRoutes, { prefix: "/api/ats" });
fastify.register(careerCoachRoutes, { prefix: "/api/career-coach" });
fastify.register(coverLetterRoutes, { prefix: "/api/cover-letter" });
fastify.register(feedbackRoutes, { prefix: "/api/feedback" });
fastify.register(interviewRoutes, { prefix: "/api/interview" });
fastify.register(jobRoutes, { prefix: "/api/job" });
fastify.register(portfolioRoutes, { prefix: "/api/portfolio" });
fastify.register(profileRoutes, { prefix: "/api/profile" });
fastify.register(seedRoutes, { prefix: "/api/seed" });
fastify.register(adminRoutes, { prefix: "/api/admin" });

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  return { status: "OK", timestamp: new Date() };
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  console.error("Unhandled fastify error:", error);
  return reply.status(error.statusCode || 500).send({
    error: error.message || "An unexpected server error occurred.",
  });
});

async function startServer() {
  try {
    // Test database connection on start
    await prisma.$connect();
    console.log("PostgreSQL Database connected successfully via Prisma.");
    
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Fastify Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
}

startServer();
