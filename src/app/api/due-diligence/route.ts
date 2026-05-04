import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await db.dueDiligence.findMany({
    where: { organizationId: session.user.organizationId! },
    include: { startup: { select: { name: true } } },
    orderBy: { reviewDate: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { startupId, reviewerName, reviewDate, notes, documentUrl } = body;

  if (!startupId || !reviewerName || !reviewDate || !documentUrl) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const record = await db.dueDiligence.create({
    data: {
      startupId,
      reviewerName,
      reviewDate: new Date(reviewDate),
      notes: notes || null,
      documentUrl,
      organizationId: session.user.organizationId!,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
