import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");
  const verticalId = searchParams.get("verticalId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { organizationId: session.user.organizationId! };
  if (programId) where.programId = programId;
  if (verticalId) where.verticalId = verticalId;

  const cohorts = await db.cohort.findMany({
    where,
    include: {
      _count: { select: { startups: true } },
      program: { select: { id: true, name: true } },
      vertical: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const programs = await db.program.findMany({
    where: { organizationId: session.user.organizationId!, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ cohorts, programs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, logo, year, startDate, endDate, programId, verticalId } = body;

    if (!name || !startDate || !programId) {
      return NextResponse.json({ error: "Name, start date, and program are required" }, { status: 400 });
    }

    // Auto-compute isActive: inactive if endDate is in the past
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const isActive = parsedEndDate ? parsedEndDate > new Date() : true;

    const cohort = await db.cohort.create({
      data: {
        name,
        description: description || null,
        logo: logo || null,
        year: year ? parseInt(year) : null,
        startDate: new Date(startDate),
        endDate: parsedEndDate,
        isActive,
        organizationId: session.user.organizationId!,
        programId,
        verticalId: verticalId || null,
      },
    });

    return NextResponse.json(cohort, { status: 201 });
  } catch (error) {
    console.error("Cohort creation error:", error);
    return NextResponse.json({ error: "Failed to create cohort" }, { status: 500 });
  }
}
