import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get mentor sessions for the organization
export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db.mentorSession.findMany({
    where: {
      mentor: { organizationId: session.user.organizationId! },
    },
    include: {
      mentor: {
        select: { user: { select: { name: true } } },
      },
      startup: {
        select: { name: true },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(sessions);
}

// Log a new mentor session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { mentorId, startupId, date, duration, notes, actionItems } = body;

    if (!mentorId || !startupId || !date || !duration) {
      return NextResponse.json(
        { error: "Mentor, startup, date, and duration are required" },
        { status: 400 }
      );
    }

    // Verify mentor belongs to this org
    const mentor = await db.mentor.findFirst({
      where: { id: mentorId, organizationId: session.user.organizationId! },
    });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Verify startup belongs to this org
    const startup = await db.startup.findFirst({
      where: {
        id: startupId,
        cohort: { organizationId: session.user.organizationId! },
      },
    });
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const mentorSession = await db.mentorSession.create({
      data: {
        mentorId,
        startupId,
        date: new Date(date),
        duration: parseInt(duration),
        notes: notes || null,
        actionItems: actionItems || null,
      },
      include: {
        mentor: { select: { user: { select: { name: true } } } },
        startup: { select: { name: true } },
      },
    });

    return NextResponse.json(mentorSession, { status: 201 });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to log session" },
      { status: 500 }
    );
  }
}
