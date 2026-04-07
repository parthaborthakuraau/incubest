import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

// Get reports
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startupId = searchParams.get("startupId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, unknown> = {};

  if (session.user.role === "STARTUP_FOUNDER") {
    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
    });
    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }
    where.startupId = startup.id;
  } else if (isIncubatorRole(session.user.role)) {
    const programId = searchParams.get("programId");
    if (startupId) {
      where.startupId = startupId;
    } else if (programId) {
      where.startup = { cohort: { programId, organizationId: session.user.organizationId! } };
    } else {
      where.startup = { cohort: { organizationId: session.user.organizationId! } };
    }
  }

  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);

  const reports = await db.report.findMany({
    where,
    include: {
      startup: { select: { name: true, slug: true } },
      template: { select: { name: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(reports);
}

// Submit a report
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { month, year, templateId, data } = body;

    const startup = await db.startup.findFirst({
      where: { founders: { some: { id: session.user.id } } },
      include: { cohort: { select: { organizationId: true } } },
    });

    if (!startup) {
      return NextResponse.json({ error: "No startup found" }, { status: 404 });
    }

    // Resolve template
    let resolvedTemplateId = templateId;
    if (!resolvedTemplateId || resolvedTemplateId === "default") {
      let defaultTemplate = await db.reportTemplate.findFirst({
        where: { organizationId: startup.cohort.organizationId, isDefault: true },
      });
      if (!defaultTemplate) {
        defaultTemplate = await db.reportTemplate.create({
          data: {
            name: "Monthly Report",
            description: "Default monthly report template",
            isDefault: true,
            organizationId: startup.cohort.organizationId,
            fields: [
              { name: "revenue", label: "Revenue", type: "number", required: true },
              { name: "employees_full_time", label: "Full-time Employees", type: "number", required: true },
              { name: "employees_part_time", label: "Part-time Employees", type: "number", required: false },
              { name: "customers", label: "Customers", type: "number", required: true },
              { name: "funding_raised", label: "Funding Raised", type: "number", required: false },
              { name: "key_achievements", label: "Key Achievements", type: "textarea", required: true },
              { name: "challenges", label: "Challenges", type: "textarea", required: false },
              { name: "support_needed", label: "Support Needed", type: "textarea", required: false },
              { name: "product_updates", label: "Product Updates", type: "textarea", required: false },
              { name: "partnerships", label: "Partnerships", type: "textarea", required: false },
            ],
          },
        });
      }
      resolvedTemplateId = defaultTemplate.id;
    }

    const report = await db.report.upsert({
      where: {
        startupId_month_year: {
          startupId: startup.id,
          month,
          year,
        },
      },
      update: {
        data,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      create: {
        month,
        year,
        data,
        status: "SUBMITTED",
        submittedAt: new Date(),
        startupId: startup.id,
        templateId: resolvedTemplateId,
      },
    });

    // Auto-sync metrics to startup snapshot
    const reportData = data as Record<string, number | string>;
    const employeesFt = Number(reportData.employees_full_time) || 0;
    const employeesPt = Number(reportData.employees_part_time) || 0;
    await db.startup.update({
      where: { id: startup.id },
      data: {
        revenue: Number(reportData.revenue) || startup.revenue,
        employeesCount: employeesFt + employeesPt,
        customersCount: Number(reportData.customers) || startup.customersCount,
        funding: startup.funding + (Number(reportData.funding_raised) || 0),
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

// Review a report (INCUBATOR_ADMIN only)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reportId, status, reviewNotes } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    // Verify the report belongs to this org's startups
    const report = await db.report.findFirst({
      where: {
        id: reportId,
        startup: { cohort: { organizationId: session.user.organizationId! } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const updated = await db.report.update({
      where: { id: reportId },
      data: {
        status: status || "REVIEWED",
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
      },
      include: {
        startup: {
          include: { founders: { select: { id: true } } },
        },
      },
    });

    // Notify startup founders
    if (updated.startup.founders.length > 0) {
      const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      await db.notification.createMany({
        data: updated.startup.founders.map((f) => ({
          userId: f.id,
          type: "report_reviewed",
          title: "Report Reviewed",
          message: `Your ${monthNames[updated.month]} ${updated.year} report has been reviewed.${reviewNotes ? ` Feedback: "${reviewNotes}"` : ""}`,
          link: "/startup/reporting",
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Report review error:", error);
    return NextResponse.json({ error: "Failed to review report" }, { status: 500 });
  }
}
