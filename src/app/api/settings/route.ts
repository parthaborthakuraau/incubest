import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";
import bcrypt from "bcryptjs";

// GET settings data
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  let organization = null;
  if (isIncubatorRole(session.user.role) && session.user.organizationId) {
    organization = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        city: true,
        state: true,
        type: true,
        logo: true,
      },
    });
  }

  return NextResponse.json({ user, organization });
}

// PATCH — update profile or org settings
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { section } = body;

    if (section === "profile") {
      const { name, phone, photo, dinNumber } = body;
      await db.user.update({
        where: { id: session.user.id },
        data: {
          name: name || undefined,
          phone: phone || undefined,
          photo: photo || undefined,
          dinNumber: dinNumber || undefined,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (section === "password") {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        return NextResponse.json({ error: "No password set" }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: session.user.id },
        data: { passwordHash },
      });

      return NextResponse.json({ success: true });
    }

    if (section === "organization") {
      if (!isIncubatorRole(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { name, description, website, city, state, type, logo } = body;
      await db.organization.update({
        where: { id: session.user.organizationId! },
        data: {
          name: name || undefined,
          description: description || undefined,
          website: website || undefined,
          city: city || undefined,
          state: state || undefined,
          type: type || undefined,
          logo: logo || undefined,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
