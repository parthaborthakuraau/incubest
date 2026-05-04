import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET forms for the org
export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forms = await db.form.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      program: { select: { name: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(forms);
}

// POST — create a form
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, type, fields, isPublic, deadline, programId } = body;

    if (!title || !type || !fields?.length) {
      return NextResponse.json({ error: "Title, type, and fields required" }, { status: 400 });
    }

    const form = await db.form.create({
      data: {
        title,
        description: description || null,
        type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: JSON.parse(JSON.stringify(fields)) as any,
        isPublic: isPublic || type === "CALL_FOR_ENTRIES",
        deadline: deadline ? new Date(deadline) : null,
        organizationId: session.user.organizationId!,
        programId: programId || null,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("Form creation error:", error);
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }
}

// DELETE a form
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.form.deleteMany({ where: { id, organizationId: session.user.organizationId! } });
  return NextResponse.json({ success: true });
}
