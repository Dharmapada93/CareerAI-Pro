import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import ATSReport from "@/models/ATSReport";
import InterviewSession from "@/models/InterviewSession";
import CoverLetter from "@/models/CoverLetter";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments();
    const totalATS = await ATSReport.countDocuments();
    const totalCoverLetters = await CoverLetter.countDocuments();

    // Subscription counts
    const freeUsers = await User.countDocuments({ subscription: "Free" });
    const proUsers = await User.countDocuments({ subscription: "Pro" });
    const enterpriseUsers = await User.countDocuments({ subscription: "Enterprise" });

    // Recent signups
    const recentUsers = await User.find()
      .select("name email subscription createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      counts: {
        users: totalUsers,
        resumes: totalResumes,
        interviews: totalInterviews,
        atsReports: totalATS,
        coverLetters: totalCoverLetters,
      },
      subscriptions: {
        Free: freeUsers,
        Pro: proUsers,
        Enterprise: enterpriseUsers,
      },
      recentUsers,
    });
  } catch (error: any) {
    console.error("GET admin stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
