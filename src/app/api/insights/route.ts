import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`insights:${session.user.id}`, 5, 60000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const orgId = session.user.organizationId!;

  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Gather all data
    const [startups, reportsThisMonth, allReports, programs] = await Promise.all([
      db.startup.findMany({
        where: { cohort: { organizationId: orgId } },
        select: {
          name: true, sector: true, focusArea: true, stage: true, revenue: true,
          funding: true, employeesCount: true, city: true, state: true,
          isWomenLed: true, isRural: true, alumniStatus: true, onboardingStatus: true,
          _count: { select: { reports: true, intellectualProperties: true } },
        },
      }),
      db.report.count({
        where: {
          startup: { cohort: { organizationId: orgId } },
          month: currentMonth, year: currentYear,
        },
      }),
      db.report.findMany({
        where: { startup: { cohort: { organizationId: orgId } } },
        select: { month: true, year: true, status: true, data: true, startup: { select: { name: true } } },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 50,
      }),
      db.program.findMany({
        where: { organizationId: orgId },
        select: { name: true, type: true, focusAreas: true, _count: { select: { cohorts: true } } },
      }),
    ]);

    const totalStartups = startups.length;
    const totalRevenue = startups.reduce((s, st) => s + st.revenue, 0);
    const totalFunding = startups.reduce((s, st) => s + st.funding, 0);
    const totalEmployees = startups.reduce((s, st) => s + st.employeesCount, 0);
    const reportingRate = totalStartups > 0 ? Math.round((reportsThisMonth / totalStartups) * 100) : 0;
    const womenLed = startups.filter((s) => s.isWomenLed).length;
    const zeroRevenue = startups.filter((s) => s.revenue === 0).length;
    const totalIPs = startups.reduce((s, st) => s + st._count.intellectualProperties, 0);

    // Recent report data for trend analysis
    const recentReportData = allReports.slice(0, 20).map((r) => ({
      startup: r.startup.name,
      month: r.month,
      year: r.year,
      status: r.status,
      data: r.data,
    }));

    const prompt = `You are an AI advisor for a startup incubator. Analyze this portfolio data and provide actionable insights.

PORTFOLIO SNAPSHOT:
- Total Startups: ${totalStartups}
- Total Revenue: ₹${Math.round(totalRevenue).toLocaleString("en-IN")}
- Total Funding Raised: ₹${Math.round(totalFunding).toLocaleString("en-IN")}
- Total Employees: ${totalEmployees}
- IPs Filed: ${totalIPs}
- Reporting Rate (this month): ${reportingRate}% (${reportsThisMonth}/${totalStartups})
- Women-Led: ${womenLed}
- Startups with Zero Revenue: ${zeroRevenue}
- Programs: ${programs.map((p) => `${p.name} (${p.type}, ${p._count.cohorts} cohorts)`).join(", ")}

SECTOR DISTRIBUTION:
${Object.entries(startups.reduce((acc, s) => { acc[s.sector] = (acc[s.sector] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([k, v]) => `${k}: ${v}`).join(", ")}

STAGE DISTRIBUTION:
${Object.entries(startups.reduce((acc, s) => { acc[s.stage] = (acc[s.stage] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([k, v]) => `${k}: ${v}`).join(", ")}

RECENT REPORTS (last 20):
${JSON.stringify(recentReportData, null, 0).slice(0, 2000)}

Provide your response in this exact JSON format:
{
  "summary": "2-3 sentence overview of the portfolio health",
  "highlights": ["positive highlight 1", "positive highlight 2", "positive highlight 3"],
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "recommendations": ["actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "metrics": {
    "portfolioHealth": "good/moderate/needs-attention",
    "revenueGrowthTrend": "up/flat/down",
    "reportingCompliance": "good/moderate/poor"
  }
}

Be specific with startup names where relevant. Use Indian number format (lakhs, crores). Be concise but insightful.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Try to parse as JSON
    let insights;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, highlights: [], concerns: [], recommendations: [], metrics: {} };
    } catch {
      insights = { summary: responseText, highlights: [], concerns: [], recommendations: [], metrics: {} };
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Insights generation error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
