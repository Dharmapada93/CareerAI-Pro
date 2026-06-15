import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { z } from "zod";

const subscriptionUpdateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  subscription: z.enum(["Free", "Pro", "Enterprise"]),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = subscriptionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { userId, subscription } = parsed.data;

    await connectToDatabase();
    
    // Prevent updating oneself
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: "Cannot modify your own subscription tier" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { subscription } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log the change
    await ActivityLog.create({
      userId: (session.user as any).id,
      action: "ADMIN_USER_TIER_UPDATE",
      details: `Updated subscription for ${user.email} (${user.name}) to ${subscription}`,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("PUT subscription update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
