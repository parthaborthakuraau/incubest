import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Allocate a space to a startup
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { spaceId, startupId, startDate, notes } = body;

    if (!spaceId || !startupId || !startDate) {
      return NextResponse.json(
        { error: "Space, startup, and start date are required" },
        { status: 400 }
      );
    }

    // Verify space belongs to admin's org
    const space = await db.space.findFirst({
      where: { id: spaceId, organizationId: session.user.organizationId! },
    });

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    const allocation = await db.spaceAllocation.create({
      data: {
        spaceId,
        startupId,
        startDate: new Date(startDate),
        notes: notes || null,
      },
      include: {
        startup: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error) {
    console.error("Allocation error:", error);
    return NextResponse.json({ error: "Failed to allocate space" }, { status: 500 });
  }
}

// Remove an allocation
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Allocation ID is required" }, { status: 400 });
    }

    // Verify allocation belongs to admin's org via space
    const allocation = await db.spaceAllocation.findFirst({
      where: {
        id,
        space: { organizationId: session.user.organizationId! },
      },
    });

    if (!allocation) {
      return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
    }

    await db.spaceAllocation.update({
      where: { id },
      data: { isActive: false, endDate: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Deallocation error:", error);
    return NextResponse.json({ error: "Failed to remove allocation" }, { status: 500 });
  }
}
