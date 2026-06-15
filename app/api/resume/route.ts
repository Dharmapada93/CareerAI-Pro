import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import Resume from "@/models/Resume";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const resumes = await Resume.find({ userId: (session.user as any).id }).sort({ updatedAt: -1 });

    return NextResponse.json(resumes);
  } catch (error: any) {
    console.error("GET resume list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, templateId } = body;

    await connectToDatabase();

    const newResume = await Resume.create({
      userId: (session.user as any).id,
      title: title || "My Resume",
      templateId: templateId || "modern",
      personalInfo: {
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        github: "",
        linkedin: "",
        website: "",
        summary: "",
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certificates: [],
    });

    return NextResponse.json(newResume, { status: 201 });
  } catch (error: any) {
    console.error("POST resume error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
