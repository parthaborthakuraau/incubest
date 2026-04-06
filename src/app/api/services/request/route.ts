import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — startup requests access to a service
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { listingId, message } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
    }

    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      select: { id: true, name: true, passportId: true },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    // Check if already requested
    const existing = await db.serviceRequest.findFirst({
      where: { listingId, startupId: startup.id },
    });

    if (existing) {
      return NextResponse.json({ error: "Already requested" }, { status: 400 });
    }

    const request = await db.serviceRequest.create({
      data: {
        listingId,
        startupId: startup.id,
        message: message || null,
        status: "REQUESTED",
      },
    });

    // Notify the incubator that owns this listing
    const listing = await db.serviceListing.findUnique({
      where: { id: listingId },
      include: { organization: { include: { admins: { select: { id: true } } } } },
    });

    if (listing) {
      const admins = listing.organization.admins;
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: "service_request",
            title: "New Service Request",
            message: `${startup.name}${startup.passportId ? ` (${startup.passportId})` : ""} has requested access to "${listing.title}"`,
            link: "/incubator/services",
          })),
        });
      }
    }

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Service request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

// PATCH — incubator approves/rejects/completes a request
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId, status, notes } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: "Request ID and status required" }, { status: 400 });
    }

    // Verify the request belongs to a listing owned by this org
    const request = await db.serviceRequest.findFirst({
      where: {
        id: requestId,
        listing: { organizationId: session.user.organizationId! },
      },
      include: {
        startup: { include: { founders: { select: { id: true } } } },
        listing: { select: { title: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await db.serviceRequest.update({
      where: { id: requestId },
      data: { status, notes: notes || undefined },
    });

    // Notify the startup founders
    const founderIds = request.startup.founders.map((f) => f.id);
    if (founderIds.length > 0) {
      const statusText = status === "APPROVED" ? "approved" : status === "REJECTED" ? "declined" : "updated";
      await db.notification.createMany({
        data: founderIds.map((uid) => ({
          userId: uid,
          type: "service_request_update",
          title: `Service Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
          message: `Your request for "${request.listing.title}" has been ${statusText}.${notes ? ` Note: ${notes}` : ""}`,
          link: "/startup/marketplace",
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Service request update error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
