import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — compute impact metrics for the entire organization
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizationId!;

  const [startups, funds, socialImpacts, jobs, ips, events] = await Promise.all([
    db.startup.findMany({
      where: { cohort: { organizationId: orgId } },
      select: {
        revenue: true, funding: true, employeesCount: true, customersCount: true,
        isWomenLed: true, isRural: true, founderCategory: true,
        fundingStatus: true, grantAmount: true, sector: true, focusArea: true,
        alumniStatus: true,
      },
    }),
    db.fund.aggregate({
      where: { startup: { cohort: { organizationId: orgId } } },
      _sum: { amount: true },
    }),
    db.socialImpact.findMany({
      where: { startup: { cohort: { organizationId: orgId } } },
      select: { metricName: true, value: true, unit: true },
    }),
    db.jobRecord.aggregate({
      where: { startup: { cohort: { organizationId: orgId } } },
      _sum: { count: true },
    }),
    db.intellectualProperty.count({
      where: { startup: { cohort: { organizationId: orgId } } },
    }),
    db.event.count({ where: { organizationId: orgId } }),
  ]);

  const totalStartups = startups.length;
  const totalRevenue = startups.reduce((s, st) => s + st.revenue, 0);
  const totalFunding = startups.reduce((s, st) => s + st.funding, 0);
  const totalEmployees = startups.reduce((s, st) => s + st.employeesCount, 0);
  const totalCustomers = startups.reduce((s, st) => s + st.customersCount, 0);
  const totalDisbursed = funds._sum.amount || 0;
  const totalJobs = jobs._sum.count || 0;
  const womenLed = startups.filter(s => s.isWomenLed).length;
  const rural = startups.filter(s => s.isRural).length;
  const scSt = startups.filter(s => s.founderCategory === "sc" || s.founderCategory === "st").length;
  const funded = startups.filter(s => s.fundingStatus === "FUNDED").length;
  const graduated = startups.filter(s => s.alumniStatus === "GRADUATED").length;
  const totalGrants = startups.reduce((s, st) => s + (st.grantAmount || 0), 0);

  // ROCE = Total Revenue / Total Funds Disbursed
  const roce = totalDisbursed > 0 ? (totalRevenue / totalDisbursed) : 0;

  // Social impact aggregation
  const impactMetrics: Record<string, { total: number; unit: string }> = {};
  for (const si of socialImpacts) {
    if (!impactMetrics[si.metricName]) impactMetrics[si.metricName] = { total: 0, unit: si.unit };
    impactMetrics[si.metricName].total += si.value;
  }

  // Portfolio health score (0-100)
  const survivalRate = totalStartups > 0 ? ((totalStartups - startups.filter(s => s.alumniStatus === "SHUT_DOWN").length) / totalStartups) * 100 : 100;
  const revenueScore = totalStartups > 0 ? Math.min((startups.filter(s => s.revenue > 0).length / totalStartups) * 100, 100) : 0;
  const employmentScore = Math.min(totalEmployees / Math.max(totalStartups, 1) * 10, 100);
  const portfolioHealth = Math.round((survivalRate * 0.3 + revenueScore * 0.3 + employmentScore * 0.2 + Math.min(roce * 20, 100) * 0.2));

  return NextResponse.json({
    overview: {
      totalStartups, totalRevenue, totalFunding, totalEmployees, totalCustomers,
      totalDisbursed, totalJobs, totalIPs: ips, totalEvents: events,
      totalGrants, funded, graduated,
    },
    diversity: { womenLed, rural, scSt },
    roce: Math.round(roce * 100) / 100,
    portfolioHealth,
    impactMetrics,
  });
}
