import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(`startup-insights:${session.user.id}`, 5, 60000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      include: {
        reports: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 },
        cohort: { include: { organization: { select: { name: true } }, program: { select: { name: true } } } },
        intellectualProperties: true,
        _count: { select: { reports: true, jobRecords: true, socialImpacts: true, documents: true } },
      },
    });

    if (!startup) return NextResponse.json({ error: "No startup" }, { status: 404 });

    const recentReports = startup.reports.map(r => ({
      month: r.month, year: r.year, data: r.data,
    }));

    const prompt = `You are an AI startup advisor. Analyze this startup's data and give actionable, encouraging insights.

STARTUP: ${startup.name}
SECTOR: ${startup.sector}
STAGE: ${startup.stage}
REVENUE: ₹${startup.revenue.toLocaleString("en-IN")}
FUNDING: ₹${startup.funding.toLocaleString("en-IN")}
EMPLOYEES: ${startup.employeesCount}
CUSTOMERS: ${startup.customersCount}
IPs FILED: ${startup.intellectualProperties.length}
REPORTS SUBMITTED: ${startup._count.reports}
INCUBATOR: ${startup.cohort.organization.name}
PROGRAM: ${startup.cohort.program?.name || "General"}

RECENT REPORTS:
${JSON.stringify(recentReports, null, 0).slice(0, 1500)}

Provide response in this JSON format:
{
  "summary": "2-3 sentence encouraging overview of the startup's momentum",
  "strengths": ["strength 1", "strength 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "actionItems": ["specific action 1", "specific action 2", "specific action 3"],
  "momentum": "growing/steady/needs-boost"
}

Be specific, encouraging, and actionable. Use Indian context where relevant.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content || "";
    let insights;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      insights = match ? JSON.parse(match[0]) : { summary: text };
    } catch {
      insights = { summary: text };
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Startup insights error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
