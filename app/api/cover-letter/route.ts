import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import CoverLetter from "@/models/CoverLetter";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const coverLetters = await CoverLetter.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(coverLetters);
  } catch (error: any) {
    console.error("GET cover letters error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyName, role, skills, experience } = await req.json();

    if (!companyName || !role || !skills || !experience) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const serviceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

    const response = await fetch(`${serviceUrl}/api/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: companyName,
        role,
        skills: Array.isArray(skills) ? skills : [skills],
        experience,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed to generate cover letter" }, { status: response.status });
    }

    const data = await response.json();

    await connectToDatabase();
    const letter = await CoverLetter.create({
      userId: (session.user as any).id,
      companyName,
      role,
      content: data.cover_letter,
    });

    return NextResponse.json(letter, { status: 201 });
  } catch (error: any) {
    console.error("POST cover letter generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
