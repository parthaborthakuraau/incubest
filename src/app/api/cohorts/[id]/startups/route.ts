import { isIncubatorRole } from "@/lib/roles";
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
  if (!session?.user || !isIncubatorRole(session.user.role)) {
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

// POST - add a startup to cohort (supports multi-incubator)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
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

    const orgId = session.user.organizationId!;

    // Check cohort belongs to this org
    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, organizationId: orgId },
    });
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Check if founder email already exists
    const existingUser = await db.user.findUnique({
      where: { email: founderEmail },
      include: {
        startups: {
          include: {
            cohort: {
              include: {
                organization: { select: { id: true, name: true } },
                program: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Collect cross-incubator warnings
    const warnings: string[] = [];

    if (existingUser) {
      // Check if already in THIS cohort
      const alreadyInThisCohort = existingUser.startups.some(s => s.cohortId === cohortId);
      if (alreadyInThisCohort) {
        return NextResponse.json(
          { error: "This founder already has a startup in this cohort" },
          { status: 400 }
        );
      }

      // Build warnings for other incubations
      for (const s of existingUser.startups) {
        const org = s.cohort.organization;
        const prog = s.cohort.program;
        if (org.id === orgId) {
          warnings.push(`Already in your org: "${s.name}" in ${prog?.name || s.cohort.name}`);
        } else {
          warnings.push(`Incubated at ${org.name}: "${s.name}" in ${prog?.name || "general"}`);
        }
      }
    }

    // Generate unique slug
    let slug = slugify(startupName);
    const existingSlug = await db.startup.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

    // Generate passport ID
    const passportId = await generateStartupPassportId(state || orgId);

    // Create the startup
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

    if (existingUser) {
      // Link existing user to new startup (many-to-many)
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          startups: { connect: { id: startup.id } },
        },
      });
    } else {
      // Create new placeholder user
      await db.user.create({
        data: {
          name: founderName,
          email: founderEmail,
          role: "STARTUP_FOUNDER",
          activeStartupId: startup.id,
          startups: { connect: { id: startup.id } },
        },
      });
    }

    // Run passport scan (non-blocking)
    runPassportScan({
      startupId: startup.id,
      name: startupName,
      founderEmail,
      founderName,
      city,
      excludeOrgId: orgId,
    }).catch((err) => console.error("Passport scan error:", err));

    return NextResponse.json(
      {
        ...startup,
        warnings: warnings.length > 0 ? warnings : undefined,
        crossIncubator: warnings.length > 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pre-register error:", error);
    return NextResponse.json({ error: "Failed to add startup" }, { status: 500 });
  }
}
