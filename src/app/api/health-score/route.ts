import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

interface HealthBreakdown {
  reporting: number;
  milestones: number;
  revenue: number;
  mentoring: number;
  team: number;
  funding: number;
  documents: number;
}

interface HealthScore {
  startupId: string;
  startupName: string;
  totalScore: number;
  breakdown: HealthBreakdown;
}

async function computeHealthScore(startupId: string, startupName: string): Promise<HealthScore> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Fetch all data in parallel
  const [reports, milestones, startup, mentorSessions, funds, documents] = await Promise.all([
    // Reports submitted in last 6 months
    db.report.count({
      where: {
        startupId,
        status: "SUBMITTED",
        submittedAt: { gte: sixMonthsAgo },
      },
    }),
    // All milestones
    db.milestone.findMany({
      where: { startupId },
      select: { status: true },
    }),
    // Startup metrics
    db.startup.findUnique({
      where: { id: startupId },
      select: { revenue: true, employeesCount: true },
    }),
    // Mentor sessions in last 6 months
    db.mentorSession.count({
      where: {
        startupId,
        date: { gte: sixMonthsAgo },
      },
    }),
    // Disbursed funds
    db.fund.findFirst({
      where: {
        startupId,
        status: "DISBURSED",
      },
    }),
    // Documents
    db.document.findMany({
      where: { startupId },
      select: { type: true },
    }),
  ]);

  // 1. Reporting Compliance (25pts): submitted reports in last 6 months / 6 * 25
  const reporting = Math.min(25, Math.round((reports / 6) * 25));

  // 2. Milestone Completion (20pts): completed / total * 20
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === "COMPLETED").length;
  const milestonesScore = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 20) : 0;

  // 3. Revenue Growth (15pts): scale linearly up to 100000
  const revenue = startup?.revenue ?? 0;
  let revenueScore = 0;
  if (revenue > 0) {
    revenueScore = Math.min(15, Math.round((revenue / 100000) * 15));
    if (revenueScore < 1) revenueScore = 1; // At least 1 if revenue > 0
  }

  // 4. Mentor Engagement (15pts): sessions in last 6 months
  let mentoringScore = 0;
  if (mentorSessions >= 3) mentoringScore = 15;
  else if (mentorSessions === 2) mentoringScore = 10;
  else if (mentorSessions === 1) mentoringScore = 5;

  // 5. Team Size (10pts)
  const employees = startup?.employeesCount ?? 0;
  let teamScore = 0;
  if (employees > 3) teamScore = 10;
  else if (employees > 0) teamScore = 5;

  // 6. Funding (10pts)
  const fundingScore = funds ? 10 : 0;

  // 7. Document Compliance (5pts)
  const docTypes = documents.map((d) => d.type);
  let documentsScore = 0;
  if (docTypes.includes("pitch_deck")) documentsScore += 2.5;
  if (docTypes.includes("dpiit_cert")) documentsScore += 2.5;

  const totalScore = reporting + milestonesScore + revenueScore + mentoringScore + teamScore + fundingScore + documentsScore;

  return {
    startupId,
    startupName,
    totalScore: Math.round(totalScore),
    breakdown: {
      reporting,
      milestones: milestonesScore,
      revenue: revenueScore,
      mentoring: mentoringScore,
      team: teamScore,
      funding: fundingScore,
      documents: documentsScore,
    },
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      select: { id: true, name: true },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    const score = await computeHealthScore(startup.id, startup.name);
    return NextResponse.json(score);
  }

  if (isIncubatorRole(session.user.role)) {
    const startups = await db.startup.findMany({
      where: {
        cohort: { organizationId: session.user.organizationId! },
      },
      select: { id: true, name: true },
    });

    const scores = await Promise.all(
      startups.map((s) => computeHealthScore(s.id, s.name))
    );

    return NextResponse.json(scores);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 403 });
}
