import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "careerai_secret_key_2026";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    subscription: string;
  };
}

export async function authMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role: string;
      subscription: string;
    };
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid or expired token." });
  }
}

export async function adminMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
  if (!request.user || request.user.role !== "admin") {
    return reply.status(403).send({ error: "Access denied. Administrator privileges required." });
  }
}
