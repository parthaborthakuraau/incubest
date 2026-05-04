import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId!;

  const events = await db.event.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { attendees: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId!;

  try {
    const body = await req.json();
    const { name, type, description, date, endDate, venue, isVirtual, maxAttendees } = body;

    if (!name || !type || !date) {
      return NextResponse.json(
        { error: "Name, type, and date are required" },
        { status: 400 }
      );
    }

    const event = await db.event.create({
      data: {
        name,
        type,
        description: description || null,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        venue: venue || null,
        isVirtual: isVirtual || false,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        organizationId: orgId,
      },
    });

    // Notify all startup founders in this org
    const founders = await db.user.findMany({
      where: {
        role: "STARTUP_FOUNDER",
        startups: { some: { cohort: { organizationId: orgId } } },
      },
      select: { id: true },
    });

    if (founders.length > 0) {
      await db.notification.createMany({
        data: founders.map((f) => ({
          userId: f.id,
          type: "event",
          title: `New Event: ${name}`,
          message: `${name} on ${new Date(date).toLocaleDateString("en-IN")}${venue ? ` at ${venue}` : ""}${isVirtual ? " (Virtual)" : ""}`,
          link: "/startup/reporting",
        })),
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
