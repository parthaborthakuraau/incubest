import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateStartupPassportId } from "@/lib/passport";
import { runPassportScan } from "@/lib/passport-scan";

// POST — bulk pre-register startups from CSV data
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
    const { rows } = body; // Array of { startupName, founderName, founderEmail, sector?, stage?, city?, state? }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Check cohort
    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, organizationId: session.user.organizationId! },
    });
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    const results: { name: string; status: "created" | "error"; error?: string }[] = [];

    for (const row of rows) {
      const { startupName, founderName, founderEmail, sector, stage, city, state } = row;

      if (!startupName || !founderName || !founderEmail) {
        results.push({ name: startupName || "Unknown", status: "error", error: "Missing required fields" });
        continue;
      }

      // Check if email already exists
      const existingUser = await db.user.findUnique({ where: { email: founderEmail } });
      if (existingUser) {
        results.push({ name: startupName, status: "error", error: `Email ${founderEmail} already registered` });
        continue;
      }

      try {
        let slug = slugify(startupName);
        const existing = await db.startup.findUnique({ where: { slug } });
        if (existing) slug = `${slug}-${Date.now().toString(36)}`;

        const passportId = await generateStartupPassportId(state);

        const startup = await db.startup.create({
          data: {
            name: startupName,
            slug,
            passportId,
            onboardingStatus: "DRAFT",
            sector: sector || "OTHER",
            stage: stage || "IDEATION",
            city: city || null,
            state: state || null,
            cohortId,
          },
        });

        await db.user.create({
          data: {
            name: founderName,
            email: founderEmail,
            role: "STARTUP_FOUNDER",
            activeStartupId: startup.id,
            startups: { connect: { id: startup.id } },
          },
        });

        // Run passport scan in background
        runPassportScan({
          startupId: startup.id, name: startupName, founderEmail,
          founderName, city, excludeOrgId: session.user.organizationId!,
        }).catch(() => {});

        results.push({ name: startupName, status: "created" });
      } catch (err) {
        results.push({ name: startupName, status: "error", error: "Creation failed" });
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const errors = results.filter((r) => r.status === "error").length;

    return NextResponse.json({ created, errors, results }, { status: 201 });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
  }
}
