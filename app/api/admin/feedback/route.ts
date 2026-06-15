import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import ActivityLog from "@/models/ActivityLog";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Log the change
    await ActivityLog.create({
      userId: (session.user as any).id,
      action: "ADMIN_FEEDBACK_RESOLVE",
      details: `Resolved and archived feedback item: ${id} from User: ${feedback.userId}`,
    });

    return NextResponse.json({ success: true, message: "Feedback marked as resolved" });
  } catch (error: any) {
    console.error("DELETE feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
