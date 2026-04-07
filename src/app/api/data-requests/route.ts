import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

// GET data requests
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isIncubatorRole(session.user.role)) {
    const orgId = session.user.organizationId!;
    const requests = await db.dataRequest.findMany({
      where: { organizationId: orgId },
      include: {
        program: { select: { name: true } },
        responses: {
          include: { startup: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also get startups list for the form
    const startups = await db.startup.findMany({
      where: { cohort: { organizationId: orgId } },
      select: { id: true, name: true, cohort: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    const programs = await db.program.findMany({
      where: { organizationId: orgId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ requests, startups, programs });
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      select: { id: true },
    });
    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const responses = await db.dataRequestResponse.findMany({
      where: { startupId: startup.id },
      include: {
        request: {
          select: { id: true, title: true, description: true, fields: true, deadline: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(responses);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

// POST — incubator creates a data request and assigns to specific startups
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, fields, deadline, startupIds, programId } = body;

    if (!title || !fields || !deadline || !startupIds?.length) {
      return NextResponse.json(
        { error: "Title, fields, deadline, and at least one startup required" },
        { status: 400 }
      );
    }

    const orgId = session.user.organizationId!;

    // Create the data request
    const dataRequest = await db.dataRequest.create({
      data: {
        title,
        description: description || null,
        fields,
        deadline: new Date(deadline),
        organizationId: orgId,
        programId: programId || null,
      },
    });

    // Create response stubs for each selected startup
    await db.dataRequestResponse.createMany({
      data: (startupIds as string[]).map((startupId) => ({
        requestId: dataRequest.id,
        startupId,
        status: "PENDING",
      })),
    });

    // Send notifications to startup founders
    const founders = await db.user.findMany({
      where: {
        role: "STARTUP_FOUNDER",
        startups: { some: { id: { in: startupIds } } },
      },
      select: { id: true },
    });

    if (founders.length > 0) {
      await db.notification.createMany({
        data: founders.map((f) => ({
          userId: f.id,
          type: "data_request",
          title: "New Data Request",
          message: `Your incubator has requested: "${title}". Deadline: ${new Date(deadline).toLocaleDateString("en-IN")}`,
          link: "/startup/data-requests",
        })),
      });
    }

    return NextResponse.json(dataRequest, { status: 201 });
  } catch (error) {
    console.error("Data request creation error:", error);
    return NextResponse.json({ error: "Failed to create data request" }, { status: 500 });
  }
}
