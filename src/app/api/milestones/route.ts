import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

// GET milestones — incubator sees all, startup sees own
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      select: { id: true, cohortId: true },
    });
    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const milestones = await db.milestone.findMany({
      where: { startupId: startup.id },
      include: { template: true },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(milestones);
  }

  if (isIncubatorRole(session.user.role)) {
    const orgId = session.user.organizationId!;
    const milestones = await db.milestone.findMany({
      where: { startup: { cohort: { organizationId: orgId } } },
      include: {
        template: true,
        startup: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(milestones);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

// PATCH — startup updates milestone status/notes
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });

    const milestone = await db.milestone.findFirst({
      where: { id, startupId: startup?.id },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const updated = await db.milestone.update({
      where: { id },
      data: {
        status,
        notes: notes ?? milestone.notes,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Milestone update error:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
