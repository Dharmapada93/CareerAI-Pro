import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";
import ActivityLog from "@/models/ActivityLog";
import { z } from "zod";

export const dynamic = "force-dynamic";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  status: z.enum(["Applied", "Interview", "Selected", "Rejected"]).default("Applied"),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
  checklist: z.array(z.object({ text: z.string(), completed: z.boolean() })).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("GET jobs error:", error);
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
    const parsed = jobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const job = await Job.create({
      userId,
      ...parsed.data,
      appliedDate: parsed.data.appliedDate ? new Date(parsed.data.appliedDate) : new Date(),
    });

    await ActivityLog.create({
      userId,
      action: "JOB_TRACKED_ADD",
      details: `Tracked new job application: ${parsed.data.title} at ${parsed.data.company}`,
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("POST jobs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const job = await Job.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("PUT jobs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;

    const job = await Job.findOneAndDelete({ _id: id, userId });

    if (!job) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    await ActivityLog.create({
      userId,
      action: "JOB_TRACKED_DELETE",
      details: `Deleted tracked job application for: ${job.title} at ${job.company}`,
    });

    return NextResponse.json({ success: true, message: "Job application deleted" });
  } catch (error: any) {
    console.error("DELETE jobs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
