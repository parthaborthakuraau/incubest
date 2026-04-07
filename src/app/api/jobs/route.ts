import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

// Get job records
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });
    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const records = await db.jobRecord.findMany({
      where: { startupId: startup.id },
      include: {
        category: { select: { id: true, name: true, type: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(records);
  }

  if (isIncubatorRole(session.user.role)) {
    const orgId = session.user.organizationId!;

    const records = await db.jobRecord.findMany({
      where: {
        startup: { cohort: { organizationId: orgId } },
      },
      include: {
        category: { select: { id: true, name: true, type: true } },
        startup: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(records);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Create/update a job record (STARTUP_FOUNDER only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { categoryId, count, month, year, description } = body;

    if (!categoryId || count === undefined || !month || !year) {
      return NextResponse.json(
        { error: "categoryId, count, month, and year are required" },
        { status: 400 }
      );
    }

    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const record = await db.jobRecord.upsert({
      where: {
        startupId_categoryId_month_year: {
          startupId: startup.id,
          categoryId,
          month,
          year,
        },
      },
      update: {
        count,
        description: description || null,
      },
      create: {
        count,
        month,
        year,
        description: description || null,
        startupId: startup.id,
        categoryId,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Job record submission error:", error);
    return NextResponse.json(
      { error: "Failed to save job record" },
      { status: 500 }
    );
  }
}
