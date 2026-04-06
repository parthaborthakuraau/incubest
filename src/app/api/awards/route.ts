import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });
    if (!startup) return NextResponse.json({ error: "No startup" }, { status: 404 });
    const awards = await db.award.findMany({
      where: { startupId: startup.id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(awards);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startup = await db.startup.findFirst({
    where: { founders: { some: { id: session.user.id } } },
  });
  if (!startup) return NextResponse.json({ error: "No startup" }, { status: 404 });

  const body = await req.json();
  const { title, description, date, image, socialUrl } = body;
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const award = await db.award.create({
    data: {
      title,
      description: description || null,
      date: date ? new Date(date) : null,
      image: image || null,
      socialUrl: socialUrl || null,
      startupId: startup.id,
    },
  });

  return NextResponse.json(award, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const startup = await db.startup.findFirst({
    where: { founders: { some: { id: session.user.id } } },
  });

  await db.award.deleteMany({ where: { id, startupId: startup?.id } });
  return NextResponse.json({ success: true });
}
