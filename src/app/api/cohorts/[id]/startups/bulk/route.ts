import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateStartupPassportId } from "@/lib/passport";
import { runPassportScan } from "@/lib/passport-scan";

// POST - bulk add startups (supports multi-incubator)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cohortId } = await params;
  const orgId = session.user.organizationId!;

  try {
    const body = await req.json();
    const { rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, organizationId: orgId },
    });
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    const results: { name: string; status: "created" | "linked" | "error"; warning?: string; error?: string }[] = [];

    for (const row of rows) {
      const { startupName, founderName, founderEmail, sector, stage, city, state } = row;

      if (!startupName || !founderName || !founderEmail) {
        results.push({ name: startupName || "Unknown", status: "error", error: "Missing required fields" });
        continue;
      }

      try {
        // Check if founder exists
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

        // Check if already in this cohort
        if (existingUser?.startups.some(s => s.cohortId === cohortId)) {
          results.push({ name: startupName, status: "error", error: "Already in this cohort" });
          continue;
        }

        // Build warning if cross-incubator
        let warning: string | undefined;
        if (existingUser && existingUser.startups.length > 0) {
          const orgs = existingUser.startups.map(s => s.cohort.organization.name);
          warning = `Also incubated at: ${[...new Set(orgs)].join(", ")}`;
        }

        let slug = slugify(startupName);
        const existingSlug = await db.startup.findUnique({ where: { slug } });
        if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

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

        if (existingUser) {
          // Link existing user to new startup
          await db.user.update({
            where: { id: existingUser.id },
            data: { startups: { connect: { id: startup.id } } },
          });
          results.push({ name: startupName, status: "linked", warning });
        } else {
          // Create new user
          await db.user.create({
            data: {
              name: founderName,
              email: founderEmail,
              role: "STARTUP_FOUNDER",
              activeStartupId: startup.id,
              startups: { connect: { id: startup.id } },
            },
          });
          results.push({ name: startupName, status: "created" });
        }

        // Run passport scan in background
        runPassportScan({
          startupId: startup.id, name: startupName, founderEmail,
          founderName, city, excludeOrgId: orgId,
        }).catch(() => {});

      } catch {
        results.push({ name: startupName, status: "error", error: "Creation failed" });
      }
    }

    const created = results.filter(r => r.status === "created").length;
    const linked = results.filter(r => r.status === "linked").length;
    const errors = results.filter(r => r.status === "error").length;

    return NextResponse.json({ created, linked, errors, results }, { status: 201 });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
  }
}
