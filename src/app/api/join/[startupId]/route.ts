import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateFounderPassportId } from "@/lib/passport";

// GET — get startup info for the join page
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  const startup = await db.startup.findUnique({
    where: { id: startupId },
    include: {
      cohort: {
        include: { organization: { select: { name: true } } },
      },
      founders: { select: { email: true, name: true, passwordHash: true } },
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  if (startup.onboardingStatus === "JOINED") {
    return NextResponse.json({ error: "This startup has already joined. Please login instead." }, { status: 400 });
  }

  const founder = startup.founders[0];
  const hasAccount = !!founder?.passwordHash;

  return NextResponse.json({
    id: startup.id,
    name: startup.name,
    sector: startup.sector,
    cohort: startup.cohort.name,
    organization: startup.cohort.organization.name,
    founderEmail: founder?.email || "",
    founderName: founder?.name || "",
    hasAccount,
  });
}

// POST — handle signup or login for the join page
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  const { startupId } = await params;

  try {
    const body = await req.json();
    const { action } = body;

    const startup = await db.startup.findUnique({
      where: { id: startupId },
      include: {
        cohort: true,
        founders: { select: { id: true, email: true, passwordHash: true } },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // ─── SIGNUP: new user, set password ────────────────
    if (action === "signup") {
      const { name, password } = body;

      if (!password || password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }

      const founder = startup.founders[0];
      if (!founder) {
        return NextResponse.json({ error: "No founder record found" }, { status: 400 });
      }

      if (founder.passwordHash) {
        return NextResponse.json({ error: "Account already exists. Please login instead." }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const passportId = await generateFounderPassportId(startup.state);

      await db.user.update({
        where: { id: founder.id },
        data: {
          name: name || undefined,
          passwordHash,
          passportId,
          activeStartupId: startupId,
        },
      });

      await db.startup.update({
        where: { id: startupId },
        data: { onboardingStatus: "JOINED" },
      });

      return NextResponse.json({ message: "Account created! You can now login." });
    }

    // ─── LOGIN: existing user, connect to this startup ──
    if (action === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { email },
        include: { startups: { select: { id: true } } },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
      }

      // Check if already connected
      if (user.startups.some((s) => s.id === startupId)) {
        return NextResponse.json({ error: "Already connected to this startup" }, { status: 400 });
      }

      // Connect this startup to the existing user
      await db.user.update({
        where: { id: user.id },
        data: {
          startups: { connect: { id: startupId } },
          activeStartupId: startupId,
        },
      });

      // Remove the placeholder user if different from the logged-in user
      const placeholder = startup.founders[0];
      if (placeholder && placeholder.id !== user.id && !placeholder.passwordHash) {
        // Disconnect placeholder from startup, delete if orphaned
        await db.user.delete({ where: { id: placeholder.id } }).catch(() => {});
      }

      await db.startup.update({
        where: { id: startupId },
        data: { onboardingStatus: "JOINED" },
      });

      return NextResponse.json({ message: "Connected! You can now login." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Join error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
