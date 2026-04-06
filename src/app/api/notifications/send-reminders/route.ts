import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — incubator admin sends report reminders to startups that haven't reported this month
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgId = session.user.organizationId!;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all startups in this org
    const startups = await db.startup.findMany({
      where: { cohort: { organizationId: orgId } },
      include: {
        founders: { select: { id: true, name: true } },
        reports: {
          where: { month: currentMonth, year: currentYear },
          select: { id: true },
        },
      },
    });

    // Filter to those who haven't reported
    const notReported = startups.filter((s) => s.reports.length === 0);

    if (notReported.length === 0) {
      return NextResponse.json({ message: "All startups have reported!", sent: 0 });
    }

    const monthName = now.toLocaleString("en-IN", { month: "long" });

    // Create notifications for all founders of non-reporting startups
    const notifications = notReported.flatMap((s) =>
      s.founders.map((f) => ({
        userId: f.id,
        type: "report_reminder",
        title: "Monthly Report Reminder",
        message: `Your monthly report for ${monthName} ${currentYear} is pending. Please submit it at your earliest convenience.`,
        link: "/startup/reports",
      }))
    );

    if (notifications.length > 0) {
      await db.notification.createMany({ data: notifications });
    }

    return NextResponse.json({
      message: `Reminders sent to ${notReported.length} startup(s)`,
      sent: notReported.length,
    });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}
