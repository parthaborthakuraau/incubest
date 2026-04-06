import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — all data for the startup dashboard in one shot
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      startups: {
        include: {
          cohort: {
            include: {
              organization: { select: { id: true, name: true, city: true, state: true, logo: true } },
              program: { select: { id: true, name: true, type: true, grantor: true } },
            },
          },
          founders: { select: { id: true, name: true, email: true, photo: true, passportId: true, dinNumber: true } },
          reports: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 },
          milestones: { include: { template: true }, orderBy: { dueDate: "asc" } },
          funds: { orderBy: { createdAt: "desc" } },
          dataRequestResponses: {
            include: {
              request: { select: { id: true, title: true, description: true, fields: true, deadline: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          intellectualProperties: true,
          _count: { select: { reports: true, jobRecords: true, socialImpacts: true, documents: true } },
        },
      },
    },
  });

  if (!user || user.startups.length === 0) {
    return NextResponse.json({ error: "No startups found", user: { id: user?.id, name: user?.name, email: user?.email } }, { status: 404 });
  }

  // Active startup
  const activeStartup = user.startups.find((s) => s.id === user.activeStartupId) || user.startups[0];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();

  // Only consider current month report due after 25th
  const hasReportedThisMonth = activeStartup.reports.some(
    (r) => r.month === currentMonth && r.year === currentYear
  );

  // Check previous month (for backfill reminder)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const hasReportedPrevMonth = activeStartup.reports.some(
    (r) => r.month === prevMonth && r.year === prevYear
  );

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Build tasks pipeline
  const tasks: { type: string; title: string; description: string; deadline?: string; link: string; priority: "high" | "medium" | "low" }[] = [];

  // Previous month backfill (if not filed)
  if (!hasReportedPrevMonth) {
    tasks.push({
      type: "report",
      title: `Submit ${monthNames[prevMonth]} ${prevYear} Report`,
      description: "You missed last month's report — backfill now",
      link: "/startup/reports",
      priority: "high",
    });
  }

  // Current month report (only prompt after 25th)
  if (dayOfMonth >= 25 && !hasReportedThisMonth) {
    tasks.push({
      type: "report",
      title: `Submit ${monthNames[currentMonth]} ${currentYear} Report`,
      description: "Your monthly report is due",
      link: "/startup/reports",
      priority: "medium",
    });
  }

  // Pending data requests
  for (const dr of activeStartup.dataRequestResponses) {
    if (dr.status === "PENDING") {
      tasks.push({
        type: "data_request",
        title: dr.request.title,
        description: dr.request.description || "Data requested by your incubator",
        deadline: new Date(dr.request.deadline).toISOString(),
        link: "/startup/data-requests",
        priority: new Date(dr.request.deadline) < now ? "high" : "medium",
      });
    }
  }

  // Overdue milestones
  for (const m of activeStartup.milestones) {
    if (m.status !== "COMPLETED" && m.dueDate && new Date(m.dueDate) < now) {
      tasks.push({
        type: "milestone",
        title: m.template.name,
        description: "Milestone overdue",
        deadline: new Date(m.dueDate).toISOString(),
        link: "/startup/milestones",
        priority: "high",
      });
    } else if (m.status === "NOT_STARTED" || m.status === "IN_PROGRESS") {
      tasks.push({
        type: "milestone",
        title: m.template.name,
        description: `Status: ${m.status.replace(/_/g, " ")}`,
        deadline: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
        link: "/startup/milestones",
        priority: "low",
      });
    }
  }

  // Sort tasks: high first, then by deadline
  tasks.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    return 0;
  });

  // Passport completion check
  const passportComplete =
    !!activeStartup.name &&
    !!user.name &&
    !!(activeStartup.dpiitNumber || activeStartup.panNumber || activeStartup.cinNumber) &&
    !!user.email;

  const passportProgress = [
    !!activeStartup.name,
    !!activeStartup.description,
    !!activeStartup.sector && activeStartup.sector !== "OTHER",
    !!user.name,
    !!user.email,
    !!(activeStartup.dpiitNumber || activeStartup.panNumber || activeStartup.cinNumber),
    !!activeStartup.logo,
    !!user.photo,
  ].filter(Boolean).length;

  // All incubators this founder is in
  const incubators = user.startups.map((s) => ({
    startupId: s.id,
    startupName: s.name,
    passportId: s.passportId,
    organization: s.cohort.organization,
    program: s.cohort.program,
    cohort: s.cohort.name,
    stage: s.stage,
    onboardingStatus: s.onboardingStatus,
    isActive: s.id === activeStartup.id,
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      passportId: user.passportId,
      dinNumber: user.dinNumber,
    },
    activeStartup: {
      id: activeStartup.id,
      name: activeStartup.name,
      slug: activeStartup.slug,
      passportId: activeStartup.passportId,
      sector: activeStartup.sector,
      stage: activeStartup.stage,
      description: activeStartup.description,
      logo: activeStartup.logo,
      website: activeStartup.website,
      city: activeStartup.city,
      state: activeStartup.state,
      revenue: activeStartup.revenue,
      funding: activeStartup.funding,
      employeesCount: activeStartup.employeesCount,
      customersCount: activeStartup.customersCount,
      dpiitRecognized: activeStartup.dpiitRecognized,
      dpiitNumber: activeStartup.dpiitNumber,
      cinNumber: activeStartup.cinNumber,
      gstNumber: activeStartup.gstNumber,
      panNumber: activeStartup.panNumber,
      founderGender: activeStartup.founderGender,
      founderCategory: activeStartup.founderCategory,
      isWomenLed: activeStartup.isWomenLed,
      isRural: activeStartup.isRural,
      fundingStatus: (activeStartup as Record<string, unknown>).fundingStatus || "INCUBATED",
      grantAmount: (activeStartup as Record<string, unknown>).grantAmount || null,
      grantDate: (activeStartup as Record<string, unknown>).grantDate || null,
      grantReference: (activeStartup as Record<string, unknown>).grantReference || null,
      grantSource: (activeStartup as Record<string, unknown>).grantSource || null,
      founders: activeStartup.founders,
      ipCount: activeStartup.intellectualProperties.length,
      _count: activeStartup._count,
      organization: activeStartup.cohort.organization,
      program: activeStartup.cohort.program,
      cohort: activeStartup.cohort.name,
    },
    incubators,
    tasks,
    passportComplete,
    passportProgress,
    currentMonth,
    currentYear,
    hasReportedThisMonth,
  });
}
