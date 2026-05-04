import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get all grantor reports + report templates for the org
export async function GET() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId!;

  const [grantorReports, reportTemplates] = await Promise.all([
    db.grantorReport.findMany({
      where: { organizationId: orgId },
      orderBy: { generatedAt: "desc" },
    }),
    db.reportTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ grantorReports, reportTemplates });
}

// Generate a new grantor report with aggregated startup data
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, grantor, period } = body;

    if (!name || !grantor || !period) {
      return NextResponse.json(
        { error: "Name, grantor, and period are required" },
        { status: 400 }
      );
    }

    const orgId = session.user.organizationId!;

    // Fetch all startups belonging to this organization
    const startups = await db.startup.findMany({
      where: { cohort: { organizationId: orgId } },
      include: {
        intellectualProperties: true,
        jobRecords: true,
      },
    });

    // Count events for this organization
    const totalEvents = await db.event.count({
      where: { organizationId: orgId },
    });

    // Count submitted reports for reporting rate calculation
    const totalReports = await db.report.count({
      where: {
        startup: { cohort: { organizationId: orgId } },
        status: "SUBMITTED",
      },
    });

    // Aggregate startup data
    const totalStartups = startups.length;
    const activeStartups = startups.filter(
      (s) => s.alumniStatus === "ACTIVE"
    ).length;
    const graduatedStartups = startups.filter(
      (s) => s.alumniStatus === "GRADUATED"
    ).length;

    const totalRevenue = startups.reduce((sum, s) => sum + s.revenue, 0);
    const totalEmployees = startups.reduce(
      (sum, s) => sum + s.employeesCount,
      0
    );
    const totalFunding = startups.reduce((sum, s) => sum + s.funding, 0);

    const totalIPsFiled = startups.reduce(
      (sum, s) => sum + s.intellectualProperties.length,
      0
    );
    const totalIPsGranted = startups.reduce(
      (sum, s) =>
        sum +
        s.intellectualProperties.filter((ip) => ip.status === "GRANTED").length,
      0
    );

    const totalJobsCreated = startups.reduce(
      (sum, s) =>
        sum + s.jobRecords.reduce((jSum, j) => jSum + j.count, 0),
      0
    );

    const womenLedStartups = startups.filter((s) => s.isWomenLed).length;
    const scStStartups = startups.filter(
      (s) =>
        s.founderCategory === "sc" || s.founderCategory === "st"
    ).length;
    const ruralStartups = startups.filter((s) => s.isRural).length;

    const reportingRate =
      totalStartups > 0
        ? Math.round((totalReports / totalStartups) * 100)
        : 0;

    // Sector distribution
    const sectors: Record<string, number> = {};
    for (const s of startups) {
      sectors[s.sector] = (sectors[s.sector] || 0) + 1;
    }

    // Stage distribution
    const stages: Record<string, number> = {};
    for (const s of startups) {
      stages[s.stage] = (stages[s.stage] || 0) + 1;
    }

    const data = {
      totalStartups,
      activeStartups,
      graduatedStartups,
      totalRevenue,
      totalEmployees,
      totalFunding,
      totalIPsFiled,
      totalIPsGranted,
      totalJobsCreated,
      totalEvents,
      womenLedStartups,
      scStStartups,
      ruralStartups,
      reportingRate,
      sectors,
      stages,
    };

    const grantorReport = await db.grantorReport.create({
      data: {
        name,
        grantor,
        period,
        data,
        organizationId: orgId,
      },
    });

    return NextResponse.json(grantorReport, { status: 201 });
  } catch (error) {
    console.error("Grantor report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate grantor report" },
      { status: 500 }
    );
  }
}
