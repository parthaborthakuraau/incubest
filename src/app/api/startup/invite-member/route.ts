import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — count current team members
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all startups this user belongs to
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { startups: { select: { id: true, founders: { select: { id: true, name: true, email: true, photo: true } } } } },
  });

  const activeStartup = user?.startups[0];
  if (!activeStartup) return NextResponse.json({ error: "No startup" }, { status: 404 });

  return NextResponse.json({
    members: activeStartup.founders,
    count: activeStartup.founders.length,
    maxMembers: 5,
  });
}

// POST — invite a co-founder
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Find the startup
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { startups: { include: { founders: true, cohort: true } } },
  });

  const startup = user?.startups[0];
  if (!startup) return NextResponse.json({ error: "No startup" }, { status: 404 });

  // Check max 5
  if (startup.founders.length >= 5) {
    return NextResponse.json({ error: "Maximum 5 team members reached" }, { status: 400 });
  }

  // Check if email already in the startup
  if (startup.founders.some(f => f.email === email)) {
    return NextResponse.json({ error: "This person is already a team member" }, { status: 400 });
  }

  // Check if user exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Connect existing user to this startup
    await db.user.update({
      where: { id: existing.id },
      data: {
        startups: { connect: { id: startup.id } },
        activeStartupId: startup.id,
        role: "STARTUP_FOUNDER",
      },
    });
    return NextResponse.json({ message: "Member added!", alreadyExists: true });
  }

  // Create invite via the join system
  const invite = await db.invite.create({
    data: {
      email,
      organizationId: startup.cohort.organizationId,
      cohortId: startup.cohortId,
      role: "STARTUP_FOUNDER",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const joinUrl = `${process.env.NEXTAUTH_URL}/join/${startup.id}`;

  return NextResponse.json({ joinUrl, message: "Invite created! Share the join link." });
}
