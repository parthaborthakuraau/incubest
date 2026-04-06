import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET mentors for a program + available mentors
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orgId = session.user.organizationId!;

  const [program, allMentors] = await Promise.all([
    db.program.findFirst({
      where: { id, organizationId: orgId },
      include: {
        mentors: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            sessions: {
              where: { startup: { cohort: { programId: id } } },
              select: { id: true, date: true, duration: true },
            },
          },
        },
      },
    }),
    db.mentor.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const assignedIds = new Set(program.mentors.map((m) => m.id));
  const available = allMentors.filter((m) => !assignedIds.has(m.id));

  return NextResponse.json({
    assigned: program.mentors,
    available,
  });
}

// POST — assign a mentor to a program
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { mentorId } = body;

  if (!mentorId) {
    return NextResponse.json({ error: "Mentor ID required" }, { status: 400 });
  }

  await db.program.update({
    where: { id },
    data: {
      mentors: { connect: { id: mentorId } },
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE — remove a mentor from a program
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const mentorId = searchParams.get("mentorId");

  if (!mentorId) {
    return NextResponse.json({ error: "Mentor ID required" }, { status: 400 });
  }

  await db.program.update({
    where: { id },
    data: {
      mentors: { disconnect: { id: mentorId } },
    },
  });

  return NextResponse.json({ success: true });
}
