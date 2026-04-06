import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET milestone templates for the org (grouped by cohort)
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId!;

  const templates = await db.milestoneTemplate.findMany({
    where: { cohort: { organizationId: orgId } },
    include: {
      cohort: { select: { id: true, name: true } },
      _count: { select: { milestones: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const cohorts = await db.cohort.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, startDate: true, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates, cohorts });
}

// POST — create a template and auto-assign milestones to all startups in the cohort
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, dueOffset, cohortId } = body;

    if (!name || !cohortId) {
      return NextResponse.json({ error: "Name and cohort are required" }, { status: 400 });
    }

    // Verify cohort belongs to this org
    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, organizationId: session.user.organizationId! },
      include: { startups: { select: { id: true } } },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Create the template
    const template = await db.milestoneTemplate.create({
      data: {
        name,
        description: description || null,
        dueOffset: dueOffset ? parseInt(dueOffset) : null,
        cohortId,
      },
    });

    // Calculate due date from cohort start + offset
    let dueDate: Date | null = null;
    if (dueOffset && cohort.startDate) {
      dueDate = new Date(cohort.startDate);
      dueDate.setDate(dueDate.getDate() + parseInt(dueOffset));
    }

    // Auto-create milestone instances for all startups in the cohort
    if (cohort.startups.length > 0) {
      await db.milestone.createMany({
        data: cohort.startups.map((s) => ({
          startupId: s.id,
          templateId: template.id,
          dueDate,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Milestone template creation error:", error);
    return NextResponse.json({ error: "Failed to create milestone template" }, { status: 500 });
  }
}

// DELETE a milestone template (cascades to milestones)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    // Verify ownership
    const template = await db.milestoneTemplate.findFirst({
      where: { id, cohort: { organizationId: session.user.organizationId! } },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await db.milestoneTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Milestone template deletion error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
