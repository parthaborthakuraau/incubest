import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get social impact records
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

    const impacts = await db.socialImpact.findMany({
      where: { startupId: startup.id },
      orderBy: [{ year: "desc" }, { month: "desc" }, { metricName: "asc" }],
    });

    // Build cumulative summary per metric
    const cumulative: Record<string, { total: number; unit: string }> = {};
    for (const impact of impacts) {
      if (!cumulative[impact.metricName]) {
        cumulative[impact.metricName] = { total: 0, unit: impact.unit };
      }
      cumulative[impact.metricName].total += impact.value;
    }

    return NextResponse.json({ impacts, cumulative });
  }

  if (session.user.role === "INCUBATOR_ADMIN") {
    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const impacts = await db.socialImpact.findMany({
      where: {
        startup: { cohort: { organizationId: orgId } },
      },
      include: {
        startup: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ metricName: "asc" }, { year: "desc" }, { month: "desc" }],
    });

    // Build cumulative summary per metric
    const cumulative: Record<string, { total: number; unit: string }> = {};
    for (const impact of impacts) {
      if (!cumulative[impact.metricName]) {
        cumulative[impact.metricName] = { total: 0, unit: impact.unit };
      }
      cumulative[impact.metricName].total += impact.value;
    }

    return NextResponse.json({ impacts, cumulative });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Create or update a social impact entry
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { metricName, value, unit, month, year, description } = body;

    if (!metricName || value == null || !unit || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields: metricName, value, unit, month, year" },
        { status: 400 }
      );
    }

    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const impact = await db.socialImpact.upsert({
      where: {
        startupId_metricName_month_year: {
          startupId: startup.id,
          metricName,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: {
        value: parseFloat(value),
        unit,
        description: description || null,
      },
      create: {
        metricName,
        value: parseFloat(value),
        unit,
        month: parseInt(month),
        year: parseInt(year),
        description: description || null,
        startupId: startup.id,
      },
    });

    return NextResponse.json(impact, { status: 201 });
  } catch (error) {
    console.error("Social impact submission error:", error);
    return NextResponse.json(
      { error: "Failed to save social impact entry" },
      { status: 500 }
    );
  }
}
