import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Create invite link for startups
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, cohortId } = body;

    if (!session.user.organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }

    const invite = await db.invite.create({
      data: {
        email: email || null,
        organizationId: session.user.organizationId,
        cohortId: cohortId || null,
        role: "STARTUP_FOUNDER",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;

    return NextResponse.json({ inviteUrl, token: invite.token }, { status: 201 });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

// List invites for an org
export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await db.invite.findMany({
    where: { organizationId: session.user.organizationId! },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}
