import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "INCUBATOR_ADMIN") {
    // Get all startups for this incubator's cohorts
    const startups = await db.startup.findMany({
      where: {
        cohort: { organizationId: session.user.organizationId! },
      },
      include: {
        cohort: { select: { name: true } },
        founders: { select: { name: true, email: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(startups);
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      include: {
        cohort: { select: { name: true, organization: { select: { name: true } } } },
        founders: { select: { name: true, email: true, phone: true } },
        milestones: { include: { template: true } },
        funds: true,
      },
    });

    return NextResponse.json(startup);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

// Update startup profile
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      logo,
      website,
      sector,
      stage,
      city,
      state,
      employeesCount,
      customersCount,
      dpiitRecognized,
      dpiitNumber,
      cinNumber,
      gstNumber,
      panNumber,
      founderGender,
      founderCategory,
      isRural,
      isWomenLed,
    } = body;

    const updated = await db.startup.update({
      where: { id: startup.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
        ...(website !== undefined && { website }),
        ...(sector && { sector }),
        ...(stage && { stage }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(employeesCount !== undefined && { employeesCount }),
        ...(customersCount !== undefined && { customersCount }),
        ...(dpiitRecognized !== undefined && { dpiitRecognized }),
        ...(dpiitNumber !== undefined && { dpiitNumber }),
        ...(cinNumber !== undefined && { cinNumber }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(panNumber !== undefined && { panNumber }),
        ...(founderGender !== undefined && { founderGender }),
        ...(founderCategory !== undefined && { founderCategory }),
        ...(isRural !== undefined && { isRural }),
        ...(isWomenLed !== undefined && { isWomenLed }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Startup update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
