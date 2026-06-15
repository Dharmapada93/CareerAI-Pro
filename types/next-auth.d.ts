import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      subscription: "Free" | "Pro" | "Enterprise";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "admin";
    subscription: "Free" | "Pro" | "Enterprise";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin";
    subscription: "Free" | "Pro" | "Enterprise";
  }
}
