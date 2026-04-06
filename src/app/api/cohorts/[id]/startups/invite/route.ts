import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — generate invite links for selected startups (or all DRAFT ones)
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
    const { startupIds } = body; // Array of startup IDs, or empty for all DRAFT

    const orgId = session.user.organizationId!;

    // Verify cohort
    const cohort = await db.cohort.findFirst({
      where: { id: cohortId, organizationId: orgId },
    });
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Get startups to invite
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { cohortId, onboardingStatus: "DRAFT" };
    if (startupIds && startupIds.length > 0) {
      where.id = { in: startupIds };
    }

    const startups = await db.startup.findMany({
      where,
      include: { founders: { select: { id: true, name: true, email: true } } },
    });

    if (startups.length === 0) {
      return NextResponse.json({ error: "No startups to invite" }, { status: 400 });
    }

    const inviteResults: { startupName: string; founderEmail: string; inviteUrl: string }[] = [];

    for (const startup of startups) {
      // Create an invite for this startup
      const invite = await db.invite.create({
        data: {
          email: startup.founders[0]?.email || null,
          organizationId: orgId,
          cohortId,
          role: "STARTUP_FOUNDER",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;

      // Update startup status to INVITED
      await db.startup.update({
        where: { id: startup.id },
        data: { onboardingStatus: "INVITED" },
      });

      // Notify the founder (if they have a user account)
      for (const founder of startup.founders) {
        await db.notification.create({
          data: {
            userId: founder.id,
            type: "invite",
            title: "You're Invited!",
            message: `You've been invited to join ${cohort.name}. Complete your profile to get started.`,
            link: inviteUrl,
          },
        }).catch(() => {}); // Ignore if notification fails
      }

      inviteResults.push({
        startupName: startup.name,
        founderEmail: startup.founders[0]?.email || "N/A",
        inviteUrl,
      });
    }

    return NextResponse.json({
      invited: inviteResults.length,
      results: inviteResults,
    }, { status: 201 });
  } catch (error) {
    console.error("Batch invite error:", error);
    return NextResponse.json({ error: "Failed to send invites" }, { status: 500 });
  }
}
