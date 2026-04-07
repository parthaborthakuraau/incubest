import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

// GET — incubator: own listings, startup: all active listings across platform
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const search = searchParams.get("q");

  if (isIncubatorRole(session.user.role)) {
    // Incubator sees own listings + incoming requests
    const listings = await db.serviceListing.findMany({
      where: { organizationId: session.user.organizationId! },
      include: {
        _count: { select: { requests: true } },
        requests: {
          include: { startup: { select: { id: true, name: true, passportId: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    // Startup sees all active listings across platform (marketplace)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true };

    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const listings = await db.serviceListing.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, city: true, state: true, logo: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get this startup's existing requests
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      select: { id: true },
    });

    let myRequests: { listingId: string; status: string; notes: string | null }[] = [];
    if (startup) {
      myRequests = await db.serviceRequest.findMany({
        where: { startupId: startup.id },
        select: { listingId: true, status: true, notes: true },
      });
    }

    const requestMap = Object.fromEntries(myRequests.map((r) => [r.listingId, { status: r.status, notes: r.notes }]));

    return NextResponse.json({
      listings: listings.map((l) => ({
        ...l,
        myRequestStatus: (requestMap[l.id] as { status: string; notes: string | null } | undefined)?.status || null,
        myRequestNotes: (requestMap[l.id] as { status: string; notes: string | null } | undefined)?.notes || null,
      })),
    });
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

// POST — incubator creates a service listing
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, image, category, pricingType, price, priceUnit, availability, city, state } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category required" }, { status: 400 });
    }

    const listing = await db.serviceListing.create({
      data: {
        title,
        description: description || null,
        image: image || null,
        category,
        pricingType: pricingType || "CONTACT_US",
        price: price ? parseFloat(price) : null,
        priceUnit: priceUnit || null,
        availability: availability || "AVAILABLE",
        city: city || null,
        state: state || null,
        organizationId: session.user.organizationId!,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Service listing error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

// DELETE — incubator removes a listing
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.serviceListing.deleteMany({
    where: { id, organizationId: session.user.organizationId! },
  });

  return NextResponse.json({ success: true });
}
