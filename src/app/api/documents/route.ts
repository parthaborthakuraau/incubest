import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get documents for the current user's startup
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });
    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const documents = await db.document.findMany({
      where: { startupId: startup.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  }

  if (session.user.role === "INCUBATOR_ADMIN") {
    const documents = await db.document.findMany({
      where: { organizationId: session.user.organizationId! },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

// Add a document
export async function POST(req: NextRequest) {
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
    const { name, type, url, size } = body;

    if (!name || !type || !url) {
      return NextResponse.json({ error: "Name, type, and URL are required" }, { status: 400 });
    }

    const document = await db.document.create({
      data: {
        name,
        type,
        url,
        size: size ? parseInt(size) : null,
        startupId: startup.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json({ error: "Failed to add document" }, { status: 500 });
  }
}

// Delete a document
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Verify the document belongs to the user's startup
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });

    const document = await db.document.findFirst({
      where: { id, startupId: startup?.id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await db.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document deletion error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
