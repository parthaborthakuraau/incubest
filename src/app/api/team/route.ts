import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET team members + pending invites
export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId!;

  const [members, invites] = await Promise.all([
    db.user.findMany({
      where: { organizationId: orgId, role: "INCUBATOR_ADMIN" },
      select: { id: true, name: true, email: true, image: true, photo: true, teamRole: true, assignedProgramId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.teamInvite.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ members, invites });
}

// POST — create a team invite
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, role, programId } = body;

    const orgId = session.user.organizationId!;

    const invite = await db.teamInvite.create({
      data: {
        email: email || null,
        role: role || "MEMBER",
        programId: programId || null,
        organizationId: orgId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/team-join/${invite.token}`;

    return NextResponse.json({ inviteUrl, token: invite.token, invite }, { status: 201 });
  } catch (error) {
    console.error("Team invite error:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

// DELETE — cancel an invite
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.teamInvite.deleteMany({
    where: { id, organizationId: session.user.organizationId! },
  });

  return NextResponse.json({ success: true });
}
