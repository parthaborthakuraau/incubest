import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get all spaces for the organization with allocations
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.organizationId!;

  const spaces = await db.space.findMany({
    where: { organizationId: orgId },
    include: {
      allocations: {
        where: { isActive: true },
        include: {
          startup: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate unused capacity for each space
  const spacesWithAvailability = spaces.map((s) => {
    const activeAllocations = s.allocations.length;
    const unused = s.capacity ? s.capacity - activeAllocations : null;
    return { ...s, activeAllocations, unused };
  });

  return NextResponse.json(spacesWithAvailability);
}

// Create a new space
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.organizationId!;

  try {
    const body = await req.json();
    const { name, type, capacity, location, description, image } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const space = await db.space.create({
      data: {
        name,
        type,
        capacity: capacity ? parseInt(capacity) : null,
        location: location || null,
        description: description || null,
        image: image || null,
        organizationId: orgId,
      },
      include: {
        allocations: {
          where: { isActive: true },
          include: {
            startup: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(space, { status: 201 });
  } catch (error) {
    console.error("Space creation error:", error);
    return NextResponse.json({ error: "Failed to create space" }, { status: 500 });
  }
}
