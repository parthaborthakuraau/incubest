import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — platform-wide stats for super admin
export async function GET() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalOrgs, totalUsers, totalStartups, totalPrograms,
    totalReports, totalMentors, totalForms, totalServices,
  ] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.startup.count(),
    db.program.count(),
    db.report.count(),
    db.mentor.count(),
    db.form.count(),
    db.serviceListing.count(),
  ]);

  const orgs = await db.organization.findMany({
    include: {
      _count: { select: { admins: true, cohorts: true, programs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentUsers = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    stats: { totalOrgs, totalUsers, totalStartups, totalPrograms, totalReports, totalMentors, totalForms, totalServices },
    orgs,
    recentUsers,
  });
}
