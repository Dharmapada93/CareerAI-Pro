import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { z } from "zod";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "feedback"]).default("feedback"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message text is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const feedback = await Feedback.create({
      userId,
      ...parsed.data,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("POST feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const items = await Feedback.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
