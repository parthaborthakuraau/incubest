import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get IPs for the current user's startup or all org startups (admin)
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

    const ips = await db.intellectualProperty.findMany({
      where: { startupId: startup.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ips);
  }

  if (session.user.role === "INCUBATOR_ADMIN") {
    const ips = await db.intellectualProperty.findMany({
      where: {
        startup: { cohort: { organizationId: session.user.organizationId! } },
      },
      include: {
        startup: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ips);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

// Create a new IP (STARTUP_FOUNDER only)
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
    const { title, type, status, applicationNo, filedDate, description } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    const ip = await db.intellectualProperty.create({
      data: {
        title,
        type,
        status: status || "FILED",
        applicationNo: applicationNo || null,
        filedDate: filedDate ? new Date(filedDate) : null,
        description: description || null,
        startupId: startup.id,
      },
    });

    return NextResponse.json(ip, { status: 201 });
  } catch (error) {
    console.error("IP creation error:", error);
    return NextResponse.json(
      { error: "Failed to create IP record" },
      { status: 500 }
    );
  }
}

// Update IP status (STARTUP_FOUNDER only)
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
    const { id, status, grantedDate } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    // Verify the IP belongs to the user's startup
    const existing = await db.intellectualProperty.findFirst({
      where: { id, startupId: startup.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "IP record not found" },
        { status: 404 }
      );
    }

    const ip = await db.intellectualProperty.update({
      where: { id },
      data: {
        status,
        grantedDate: grantedDate ? new Date(grantedDate) : undefined,
      },
    });

    return NextResponse.json(ip);
  } catch (error) {
    console.error("IP update error:", error);
    return NextResponse.json(
      { error: "Failed to update IP record" },
      { status: 500 }
    );
  }
}
