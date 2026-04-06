import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateStartupPassportId } from "@/lib/passport";
import { runPassportScan } from "@/lib/passport-scan";

// GET startups in a cohort
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const cohort = await db.cohort.findFirst({
    where: { id, organizationId: session.user.organizationId! },
    select: { id: true, name: true, programId: true, verticalId: true },
  });

  if (!cohort) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  const startups = await db.startup.findMany({
    where: { cohortId: id },
    include: {
      founders: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(startups);
}

// POST — pre-register a single startup (DRAFT status)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cohortId } = await params;

  try {
    const body = await req.json();
    const { startupName, founderName, founderEmail, sector, focusArea, stage, city, state } = body;

    if (!startupName || !founderName || !founderEmail) {
      return NextResponse.json(
        { error: "Startup name, founder name, and email are required" },
        { status: 400 }
      );
    }

    // Check cohort belongs to this org
    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, organizationId: session.user.organizationId! },
    });
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email: founderEmail } });
    if (existingUser) {
      return NextResponse.json({ error: `Email ${founderEmail} already registered` }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(startupName);
    const existing = await db.startup.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    // Generate passport ID
    const passportId = await generateStartupPassportId(state || cohort.organizationId);

    const startup = await db.startup.create({
      data: {
        name: startupName,
        slug,
        passportId,
        onboardingStatus: "DRAFT",
        sector: sector || "OTHER",
        focusArea: focusArea || null,
        stage: stage || "IDEATION",
        city: city || null,
        state: state || null,
        cohortId,
      },
    });

    // Create a placeholder user (no password — they'll set it on the join page)
    await db.user.create({
      data: {
        name: founderName,
        email: founderEmail,
        role: "STARTUP_FOUNDER",
        activeStartupId: startup.id,
        startups: { connect: { id: startup.id } },
      },
    });

    // Run passport scan (non-blocking — don't fail the request if scan fails)
    runPassportScan({
      startupId: startup.id,
      name: startupName,
      founderEmail,
      founderName,
      city,
      excludeOrgId: session.user.organizationId!,
    }).catch((err) => console.error("Passport scan error:", err));

    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    console.error("Pre-register error:", error);
    return NextResponse.json({ error: "Failed to add startup" }, { status: 500 });
  }
}
