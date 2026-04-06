import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateStartupPassportId, generateFounderPassportId } from "@/lib/passport";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      founderName,
      founderEmail,
      password,
      startupName,
      description,
      sector,
      stage,
      city,
      state,
      website,
    } = body;

    // Validate invite
    const invite = await db.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400 }
      );
    }
    if (new Date() > invite.expiresAt) {
      await db.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: founderEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const startupSlug = slugify(startupName);

    // Find a cohort to assign (use the one from invite, or the latest active one)
    let cohortId = invite.cohortId;
    if (!cohortId) {
      const latestCohort = await db.cohort.findFirst({
        where: { organizationId: invite.organizationId, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (!latestCohort) {
        return NextResponse.json(
          { error: "No active cohort found. Ask your incubator to create one." },
          { status: 400 }
        );
      }
      cohortId = latestCohort.id;
    }

    // ─── Cross-Incubator Detection ──────────────────────
    // Check if this founder or startup already exists in any other incubator
    const crossIncubatorFlags: string[] = [];

    // Check founder email across other orgs
    const existingFounder = await db.user.findFirst({
      where: {
        email: founderEmail,
        role: "STARTUP_FOUNDER",
      },
      include: {
        startups: {
          include: {
            cohort: {
              include: { organization: { select: { name: true } } },
            },
          },
        },
      },
    });
    // existingFounder would be caught by the uniqueness check above,
    // but we keep this for future cases where same person joins with different email

    // Check by DPIIT / CIN / PAN if provided
    const { dpiitNumber, cinNumber, panNumber } = body;
    if (dpiitNumber || cinNumber || panNumber) {
      const conditions = [];
      if (dpiitNumber) conditions.push({ dpiitNumber });
      if (cinNumber) conditions.push({ cinNumber });
      if (panNumber) conditions.push({ panNumber });

      const matchingStartups = await db.startup.findMany({
        where: {
          OR: conditions,
          cohort: {
            organizationId: { not: invite.organizationId },
          },
        },
        include: {
          cohort: {
            include: { organization: { select: { name: true } } },
          },
        },
      });

      for (const match of matchingStartups) {
        const matchedOn = [];
        if (dpiitNumber && match.dpiitNumber === dpiitNumber) matchedOn.push("DPIIT");
        if (cinNumber && match.cinNumber === cinNumber) matchedOn.push("CIN");
        if (panNumber && match.panNumber === panNumber) matchedOn.push("PAN");

        crossIncubatorFlags.push(
          `${match.name} is already incubated at ${match.cohort.organization.name} (matched on ${matchedOn.join(", ")})`
        );
      }
    }

    // Generate passport IDs
    const startupPassportId = await generateStartupPassportId(state);
    const founderPassportId = await generateFounderPassportId(state);

    // Create startup and user in transaction
    await db.$transaction(async (tx) => {
      const startup = await tx.startup.create({
        data: {
          name: startupName,
          slug: startupSlug,
          passportId: startupPassportId,
          description,
          sector: sector || "OTHER",
          stage: stage || "IDEATION",
          city,
          state,
          website,
          cohortId,
          dpiitNumber: dpiitNumber || null,
          cinNumber: cinNumber || null,
          panNumber: panNumber || null,
        },
      });

      await tx.user.create({
        data: {
          name: founderName,
          email: founderEmail,
          passwordHash,
          passportId: founderPassportId,
          role: "STARTUP_FOUNDER",
          activeStartupId: startup.id,
          startups: { connect: { id: startup.id } },
        },
      });

      // Mark startup as joined
      await tx.startup.update({
        where: { id: startup.id },
        data: { onboardingStatus: "JOINED" },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });

      // If cross-incubator flags found, notify the incubator admins
      if (crossIncubatorFlags.length > 0) {
        const admins = await tx.user.findMany({
          where: {
            organizationId: invite.organizationId,
            role: "INCUBATOR_ADMIN",
          },
          select: { id: true },
        });

        if (admins.length > 0) {
          await tx.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: "cross_incubator_alert",
              title: "Cross-Incubator Detection",
              message: `${startupName} (founder: ${founderName}) may already be incubated elsewhere:\n${crossIncubatorFlags.join("\n")}`,
              link: `/incubator/startups/${startup.id}`,
            })),
          });
        }
      }
    });

    return NextResponse.json({
      message: "Successfully joined!",
      crossIncubatorFlags: crossIncubatorFlags.length > 0 ? crossIncubatorFlags : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Failed to process invite" },
      { status: 500 }
    );
  }
}
