import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH — startup submits response to a data request
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { responseId, data } = body;

    if (!responseId || !data) {
      return NextResponse.json({ error: "Response ID and data required" }, { status: 400 });
    }

    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      select: { id: true },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    // Verify the response belongs to this startup
    const response = await db.dataRequestResponse.findFirst({
      where: { id: responseId, startupId: startup.id },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    const updated = await db.dataRequestResponse.update({
      where: { id: responseId },
      data: {
        data,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      include: {
        request: {
          include: { organization: { include: { admins: { select: { id: true } } } } },
        },
      },
    });

    // Notify incubator admins
    const admins = updated.request.organization.admins;
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "data_request_response",
          title: "Data Request Response",
          message: `A startup has responded to "${updated.request.title}"`,
          link: `/incubator/data-requests`,
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Data request response error:", error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
