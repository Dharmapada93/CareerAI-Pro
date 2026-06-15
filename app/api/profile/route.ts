import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import ATSReport from "@/models/ATSReport";
import InterviewSession from "@/models/InterviewSession";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch quick stats for profile display
    const resumeCount = await Resume.countDocuments({ userId });
    const interviewCount = await InterviewSession.countDocuments({ userId, status: "completed" });
    
    const atsReports = await ATSReport.find({ userId }).select("score");
    const highestAts = atsReports.length > 0 ? Math.max(...atsReports.map((r) => r.score)) : 0;

    return NextResponse.json({
      user,
      stats: {
        resumeCount,
        interviewCount,
        highestAts,
      },
    });
  } catch (error: any) {
    console.error("GET profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, subscription } = await req.json();
    const userId = (session.user as any).id;

    await connectToDatabase();

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (subscription) updateFields.subscription = subscription;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("PUT profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
