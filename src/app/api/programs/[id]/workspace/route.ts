import { isIncubatorRole } from "@/lib/roles";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — all data for the program workspace in one shot
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orgId = session.user.organizationId!;

  const program = await db.program.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Parallel fetch everything
  const [
    cohorts,
    startups,
    reportsThisMonth,
    allReports,
    milestones,
    mentorSessions,
    funds,
    dataRequests,
    events,
    verticals,
  ] = await Promise.all([
    // Cohorts
    db.cohort.findMany({
      where: { programId: id, organizationId: orgId },
      include: {
        _count: { select: { startups: true } },
        vertical: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Startups with full data
    db.startup.findMany({
      where: { cohort: { programId: id, organizationId: orgId } },
      include: {
        cohort: { select: { id: true, name: true } },
        founders: { select: { id: true, name: true, email: true, phone: true } },
        funds: { orderBy: { createdAt: "desc" } },
        intellectualProperties: true,
        _count: { select: { reports: true, milestones: true, jobRecords: true, socialImpacts: true } },
      },
      orderBy: { name: "asc" },
    }),

    // Reports this month
    db.report.findMany({
      where: {
        startup: { cohort: { programId: id, organizationId: orgId } },
        month: currentMonth,
        year: currentYear,
      },
      select: { startupId: true, status: true },
    }),

    // All reports (for compliance tab)
    db.report.findMany({
      where: { startup: { cohort: { programId: id, organizationId: orgId } } },
      include: { startup: { select: { id: true, name: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),

    // Milestones
    db.milestone.findMany({
      where: { startup: { cohort: { programId: id, organizationId: orgId } } },
      include: {
        template: { select: { name: true } },
        startup: { select: { id: true, name: true } },
      },
    }),

    // Mentor sessions
    db.mentorSession.findMany({
      where: { startup: { cohort: { programId: id, organizationId: orgId } } },
      include: {
        mentor: { include: { user: { select: { name: true } } } },
        startup: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    }),

    // Funds (per startup)
    db.fund.findMany({
      where: { startup: { cohort: { programId: id, organizationId: orgId } } },
      include: { startup: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),

    // Data requests
    db.dataRequest.findMany({
      where: { programId: id, organizationId: orgId },
      include: {
        responses: {
          include: { startup: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Events count
    db.event.count({ where: { organizationId: orgId } }),

    // Verticals
    db.vertical.findMany({
      where: { programId: id },
      include: {
        cohorts: {
          include: { _count: { select: { startups: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Aggregates
  const totalRevenue = startups.reduce((s, st) => s + st.revenue, 0);
  const totalFunding = startups.reduce((s, st) => s + st.funding, 0);
  const totalEmployees = startups.reduce((s, st) => s + st.employeesCount, 0);
  const totalCustomers = startups.reduce((s, st) => s + st.customersCount, 0);

  const reportedIds = new Set(reportsThisMonth.map((r) => r.startupId));
  const reportingRate = startups.length > 0
    ? Math.round((reportedIds.size / startups.length) * 100)
    : 0;

  // Milestone stats
  const milestoneCompleted = milestones.filter((m) => m.status === "COMPLETED").length;
  const milestoneTotal = milestones.length;

  // Fund aggregates
  const totalDisbursed = funds
    .filter((f) => f.status === "DISBURSED" || f.status === "UTILIZED")
    .reduce((s, f) => s + f.amount, 0);
  const totalUtilized = funds
    .filter((f) => f.status === "UTILIZED")
    .reduce((s, f) => s + f.amount, 0);

  // Sector distribution
  const sectors: Record<string, number> = {};
  const stages: Record<string, number> = {};
  for (const s of startups) {
    sectors[s.sector] = (sectors[s.sector] || 0) + 1;
    stages[s.stage] = (stages[s.stage] || 0) + 1;
  }

  // Women-led, SC/ST, rural
  const womenLed = startups.filter((s) => s.isWomenLed).length;
  const scSt = startups.filter((s) => s.founderCategory === "sc" || s.founderCategory === "st").length;
  const rural = startups.filter((s) => s.isRural).length;

  // Founders list
  const founders = startups.flatMap((s) =>
    s.founders.map((f) => ({
      ...f,
      startupId: s.id,
      startupName: s.name,
      cohortName: s.cohort.name,
      sector: s.sector,
      stage: s.stage,
    }))
  );

  return NextResponse.json({
    program,
    overview: {
      totalStartups: startups.length,
      activeCohorts: cohorts.filter((c) => c.isActive).length,
      totalRevenue,
      totalFunding,
      totalEmployees,
      totalCustomers,
      reportingRate,
      reportedCount: reportedIds.size,
      milestoneCompleted,
      milestoneTotal,
      totalDisbursed,
      totalUtilized,
      womenLed,
      scSt,
      rural,
      sectors,
      stages,
      totalIPs: startups.reduce((s, st) => s + st.intellectualProperties.length, 0),
      totalIPsGranted: startups.reduce(
        (s, st) => s + st.intellectualProperties.filter((ip) => ip.status === "GRANTED").length,
        0
      ),
      events,
    },
    cohorts,
    startups: startups.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      sector: s.sector,
      stage: s.stage,
      city: s.city,
      state: s.state,
      revenue: s.revenue,
      funding: s.funding,
      employeesCount: s.employeesCount,
      customersCount: s.customersCount,
      dpiitRecognized: s.dpiitRecognized,
      isWomenLed: s.isWomenLed,
      isRural: s.isRural,
      founderGender: s.founderGender,
      founderCategory: s.founderCategory,
      alumniStatus: s.alumniStatus,
      cohort: s.cohort,
      founders: s.founders,
      ipCount: s.intellectualProperties.length,
      _count: s._count,
      createdAt: s.createdAt,
    })),
    founders,
    funds,
    reports: allReports,
    milestones,
    mentorSessions,
    dataRequests,
    verticals,
    currentMonth,
    currentYear,
  });
}
