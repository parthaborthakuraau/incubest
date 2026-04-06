import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDefaultTemplates } from "@/lib/default-templates";

// GET programs for the org
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const programs = await db.program.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      _count: { select: { cohorts: true, reportTemplates: true, dataRequests: true } },
      cohorts: {
        select: { id: true, name: true, isActive: true, _count: { select: { startups: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(programs);
}

// POST — create a program
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, grantor, description, reportingCycle } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const orgId = session.user.organizationId!;

    const program = await db.program.create({
      data: {
        name,
        type,
        grantor: grantor || null,
        description: description || null,
        reportingCycle: reportingCycle || "MONTHLY",
        organizationId: orgId,
      },
    });

    // Auto-create default report templates for known program types
    const defaultTemplates = getDefaultTemplates(type);
    if (defaultTemplates.length > 0) {
      await db.reportTemplate.createMany({
        data: defaultTemplates.map((t) => ({
          name: t.name,
          description: t.description,
          grantor: t.grantor,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fields: JSON.parse(JSON.stringify(t.fields)) as any,
          organizationId: orgId,
          programId: program.id,
        })),
      });
    }

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Program creation error:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}

// PATCH — update a program
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Program ID required" }, { status: 400 });
    }

    const program = await db.program.findFirst({
      where: { id, organizationId: session.user.organizationId! },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const updated = await db.program.update({
      where: { id },
      data: {
        name: updates.name || undefined,
        type: updates.type || undefined,
        grantor: updates.grantor ?? undefined,
        description: updates.description ?? undefined,
        reportingCycle: updates.reportingCycle || undefined,
        focusAreas: updates.focusAreas ?? undefined,
        totalFundPool: updates.totalFundPool !== undefined ? updates.totalFundPool : undefined,
        isActive: updates.isActive ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Program update error:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}
