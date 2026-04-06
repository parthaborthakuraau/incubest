import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET — get invite info
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await db.teamInvite.findUnique({
    where: { token },
    include: {
      organization: { select: { name: true } },
    },
  });

  if (!invite || invite.status !== "PENDING") {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
  }

  // Get program name if assigned
  let programName: string | null = null;
  if (invite.programId) {
    const program = await db.program.findUnique({
      where: { id: invite.programId },
      select: { name: true },
    });
    programName = program?.name || null;
  }

  return NextResponse.json({
    orgName: invite.organization.name,
    role: invite.role,
    programName,
    email: invite.email,
  });
}

// POST — accept invite and create account
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const invite = await db.teamInvite.findUnique({ where: { token } });

    if (!invite || invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (!existing.organizationId) {
        await db.user.update({
          where: { id: existing.id },
          data: {
            organizationId: invite.organizationId,
            role: "INCUBATOR_ADMIN",
            teamRole: invite.role,
            assignedProgramId: invite.programId || null,
          },
        });
      }
      await db.teamInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json({ message: "Connected to organization!" });
    }

    // Create new user
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "INCUBATOR_ADMIN",
        teamRole: invite.role,
        assignedProgramId: invite.programId || null,
        organizationId: invite.organizationId,
      },
    });

    await db.teamInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json({ message: "Account created! You can now login." });
  } catch (error) {
    console.error("Team join error:", error);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
