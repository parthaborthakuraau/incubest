import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH — graduate a startup from INCUBATED to FUNDED
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { startupId, fundingStatus, grantAmount, grantDate, grantReference, grantSource } = body;

    if (!startupId || !fundingStatus) {
      return NextResponse.json({ error: "Startup ID and funding status required" }, { status: 400 });
    }

    // Verify startup belongs to this org
    const startup = await db.startup.findFirst({
      where: { id: startupId, cohort: { organizationId: session.user.organizationId! } },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const updated = await db.startup.update({
      where: { id: startupId },
      data: {
        fundingStatus,
        grantAmount: grantAmount ? parseFloat(grantAmount) : undefined,
        grantDate: grantDate ? new Date(grantDate) : undefined,
        grantReference: grantReference || undefined,
        grantSource: grantSource || undefined,
      },
    });

    // Notify startup founders
    const founders = await db.user.findMany({
      where: { startups: { some: { id: startupId } } },
      select: { id: true },
    });

    if (founders.length > 0 && fundingStatus === "FUNDED") {
      await db.notification.createMany({
        data: founders.map((f) => ({
          userId: f.id,
          type: "funding_status",
          title: "Funding Status Updated",
          message: `Your startup has been marked as funded!${grantAmount ? ` Grant: ₹${parseFloat(grantAmount).toLocaleString("en-IN")}` : ""}`,
          link: "/startup/my-startup",
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Fund status error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
