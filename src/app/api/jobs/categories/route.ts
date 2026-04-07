import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

// Get all job categories for the org
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orgId: string | undefined;

  if (isIncubatorRole(session.user.role)) {
    orgId = session.user.organizationId!;
  } else if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      include: { cohort: { select: { organizationId: true } } },
    });
    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }
    orgId = startup.cohort.organizationId;
  }

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await db.jobCategory.findMany({
    where: { organizationId: orgId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(categories);
}

// Create a new job category (INCUBATOR_ADMIN only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (type !== "direct" && type !== "indirect") {
      return NextResponse.json(
        { error: "Type must be 'direct' or 'indirect'" },
        { status: 400 }
      );
    }

    const orgId = session.user.organizationId!;

    const category = await db.jobCategory.create({
      data: {
        name,
        type,
        description: description || null,
        organizationId: orgId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }
    console.error("Job category creation error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
