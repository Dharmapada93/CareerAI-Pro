import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "careerai_secret_key_2026";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, email, password } = request.body as any;

    if (!name || !email || !password) {
      return reply.status(400).send({ error: "Name, email and password are required fields" });
    }

    if (password.length < 6) {
      return reply.status(400).send({ error: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return reply.status(400).send({ error: "A user with this email address already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        subscription: "Free",
      },
    });

    return reply.status(201).send({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return reply.status(500).send({ error: "An internal server error occurred" });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: "Please enter your email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return reply.status(400).send({ error: "No user found with this email" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return reply.status(400).send({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return reply.status(200).send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return reply.status(500).send({ error: "An internal server error occurred" });
  }
}

export async function getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) {
      return reply.status(401).send({ error: "Not authorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return reply.status(200).send({ user: userWithoutPassword });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return reply.status(500).send({ error: "An internal server error occurred" });
  }
}
