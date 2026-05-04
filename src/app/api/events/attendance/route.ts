import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const attendances = await db.eventAttendance.findMany({
    where: { eventId },
    include: {
      startup: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json(attendances);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { eventId, attendees } = body;

    if (!eventId || !Array.isArray(attendees)) {
      return NextResponse.json(
        { error: "eventId and attendees array are required" },
        { status: 400 }
      );
    }

    // Upsert each attendance record
    const results = await Promise.all(
      attendees.map(
        (a: { startupId: string; attended: boolean }) =>
          db.eventAttendance.upsert({
            where: {
              eventId_startupId: {
                eventId,
                startupId: a.startupId,
              },
            },
            update: { attended: a.attended },
            create: {
              eventId,
              startupId: a.startupId,
              attended: a.attended,
            },
          })
      )
    );

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Attendance update error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
