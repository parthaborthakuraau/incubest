import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET verticals (filtered by programId)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");

  if (!programId) {
    return NextResponse.json({ error: "programId required" }, { status: 400 });
  }

  const verticals = await db.vertical.findMany({
    where: { programId, program: { organizationId: session.user.organizationId! } },
    include: {
      cohorts: {
        include: { _count: { select: { startups: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(verticals);
}

// POST — create a vertical under a program
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, logo, programId } = body;

    if (!name || !programId) {
      return NextResponse.json({ error: "Name and programId required" }, { status: 400 });
    }

    // Verify program belongs to this org
    const program = await db.program.findFirst({
      where: { id: programId, organizationId: session.user.organizationId! },
    });
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const vertical = await db.vertical.create({
      data: {
        name,
        description: description || null,
        logo: logo || null,
        programId,
      },
    });

    return NextResponse.json(vertical, { status: 201 });
  } catch (error) {
    console.error("Vertical creation error:", error);
    return NextResponse.json({ error: "Failed to create vertical" }, { status: 500 });
  }
}

// DELETE a vertical
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.vertical.deleteMany({
    where: { id, program: { organizationId: session.user.organizationId! } },
  });

  return NextResponse.json({ success: true });
}
