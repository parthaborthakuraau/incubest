import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startups = await db.startup.findMany({
    where: {
      cohort: { organizationId: session.user.organizationId! },
    },
    select: {
      id: true,
      name: true,
      sector: true,
      alumniStatus: true,
      graduatedAt: true,
      postGradRevenue: true,
      postGradFunding: true,
      postGradEmployees: true,
      acquiredBy: true,
      alumniNotes: true,
      cohort: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(startups);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      startupId,
      alumniStatus,
      graduatedAt,
      postGradRevenue,
      postGradFunding,
      postGradEmployees,
      acquiredBy,
      alumniNotes,
    } = body;

    if (!startupId) {
      return NextResponse.json({ error: "startupId is required" }, { status: 400 });
    }

    // Verify the startup belongs to this admin's organization
    const startup = await db.startup.findFirst({
      where: {
        id: startupId,
        cohort: { organizationId: session.user.organizationId! },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const updated = await db.startup.update({
      where: { id: startupId },
      data: {
        ...(alumniStatus !== undefined && { alumniStatus }),
        ...(graduatedAt !== undefined && { graduatedAt: graduatedAt ? new Date(graduatedAt) : null }),
        ...(postGradRevenue !== undefined && { postGradRevenue }),
        ...(postGradFunding !== undefined && { postGradFunding }),
        ...(postGradEmployees !== undefined && { postGradEmployees }),
        ...(acquiredBy !== undefined && { acquiredBy }),
        ...(alumniNotes !== undefined && { alumniNotes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Alumni update error:", error);
    return NextResponse.json({ error: "Failed to update alumni data" }, { status: 500 });
  }
}
