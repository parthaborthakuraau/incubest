import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get all report templates for the org
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await db.reportTemplate.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

// Create a new report template
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, grantor, fields } = body;

    if (!name || !fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: "Name and at least one field are required" },
        { status: 400 }
      );
    }

    // Validate field definitions
    for (const field of fields) {
      if (!field.name || !field.label || !field.type) {
        return NextResponse.json(
          { error: "Each field must have name, label, and type" },
          { status: 400 }
        );
      }
      const validTypes = ["text", "number", "textarea", "select", "date", "checkbox"];
      if (!validTypes.includes(field.type)) {
        return NextResponse.json(
          { error: `Invalid field type: ${field.type}` },
          { status: 400 }
        );
      }
    }

    const template = await db.reportTemplate.create({
      data: {
        name,
        description: description || null,
        grantor: grantor || null,
        fields,
        organizationId: session.user.organizationId!,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// Delete a report template (only if no reports use it)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Template ID is required" },
      { status: 400 }
    );
  }

  // Verify template belongs to this org
  const template = await db.reportTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId!,
    },
    include: { _count: { select: { reports: true } } },
  });

  if (!template) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }

  if (template._count.reports > 0) {
    return NextResponse.json(
      { error: "Cannot delete template that has reports associated with it" },
      { status: 400 }
    );
  }

  await db.reportTemplate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
