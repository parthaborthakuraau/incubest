import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Get mentors for the organization
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentors = await db.mentor.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(mentors);
}

// Add a new mentor
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, expertise, bio, linkedIn, photo, cvUrl } = body;

    if (!name || !email || !expertise?.length) {
      return NextResponse.json(
        { error: "Name, email, and expertise are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });

    const mentor = await db.$transaction(async (tx) => {
      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        // Check if already a mentor
        const existingMentor = await tx.mentor.findUnique({
          where: { userId },
        });
        if (existingMentor) {
          throw new Error("This user is already a mentor");
        }
      } else {
        // Create user with a temporary password
        const tempPassword = await bcrypt.hash("mentor123", 10);
        const user = await tx.user.create({
          data: {
            name,
            email,
            passwordHash: tempPassword,
            role: "MENTOR",
          },
        });
        userId = user.id;
      }

      return tx.mentor.create({
        data: {
          userId,
          organizationId: session.user.organizationId!,
          expertise,
          bio: bio || null,
          linkedIn: linkedIn || null,
          photo: photo || null,
          cvUrl: cvUrl || null,
        },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { sessions: true } },
        },
      });
    });

    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    console.error("Mentor creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to add mentor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
