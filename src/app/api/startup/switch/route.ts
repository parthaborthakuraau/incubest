import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — switch active startup context
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { startupId } = await req.json();

  // Verify user is connected to this startup
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { startups: { select: { id: true } } },
  });

  if (!user?.startups.some((s) => s.id === startupId)) {
    return NextResponse.json({ error: "Not your startup" }, { status: 403 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { activeStartupId: startupId },
  });

  return NextResponse.json({ success: true });
}
