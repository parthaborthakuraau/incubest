import { auth } from "@/lib/auth";
import { isIncubatorRole } from "@/lib/roles";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  TrendingUp,
  FileText,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  IndianRupee,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { SendRemindersButton } from "@/components/dashboard/send-reminders-button";
import { DistributionCharts } from "@/components/dashboard/distribution-charts";
import { AIInsights } from "@/components/dashboard/ai-insights";

export default async function IncubatorDashboard() {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    redirect("/login");
  }

  const orgId = session.user.organizationId!;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [cohorts, allStartups, reportsThisMonth, pendingReviewReports, recentReports] =
    await Promise.all([
      db.cohort.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { startups: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.startup.findMany({
        where: { cohort: { organizationId: orgId } },
        include: {
          cohort: { select: { name: true } },
          founders: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.report.findMany({
        where: {
          startup: { cohort: { organizationId: orgId } },
          month: currentMonth,
          year: currentYear,
        },
        select: { startupId: true, status: true },
      }),
      db.report.findMany({
        where: {
          startup: { cohort: { organizationId: orgId } },
          status: "SUBMITTED",
        },
        include: {
          startup: { select: { name: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 10,
      }),
      db.report.findMany({
        where: { startup: { cohort: { organizationId: orgId } } },
        include: { startup: { select: { name: true } } },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
    ]);

  // Programs
  const programs = await db.program.findMany({
    where: { organizationId: orgId },
    include: {
      cohorts: {
        include: { _count: { select: { startups: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStartups = allStartups.length;
  const activeCohorts = cohorts.filter((c) => c.isActive).length;

  // Portfolio aggregates
  const aggregates = await db.startup.aggregate({
    where: { cohort: { organizationId: orgId } },
    _sum: { employeesCount: true, revenue: true, funding: true },
  });

  // Who hasn't reported this month
  const reportedStartupIds = new Set(reportsThisMonth.map((r) => r.startupId));
  const notReported = allStartups.filter((s) => !reportedStartupIds.has(s.id));

  const reportingRate =
    totalStartups > 0
      ? Math.round((reportedStartupIds.size / totalStartups) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview across all programs &middot; Welcome back, {session.user.name}
          </p>
        </div>
        <Link href="/chat">
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask AI
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Startups"
          value={totalStartups}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Active Cohorts"
          value={activeCohorts}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Portfolio Revenue"
          value={formatCurrency(aggregates._sum.revenue || 0)}
          icon={IndianRupee}
          color="green"
        />
        <StatCard
          title="Reporting Rate"
          value={`${reportingRate}%`}
          change={`${reportedStartupIds.size}/${totalStartups} for ${getMonthName(currentMonth)}`}
          changeType={reportingRate >= 80 ? "positive" : "negative"}
          icon={FileText}
          color="orange"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Jobs Created"
          value={aggregates._sum.employeesCount || 0}
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          title="Total Funding"
          value={formatCurrency(aggregates._sum.funding || 0)}
          icon={IndianRupee}
          color="pink"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviewReports.length}
          icon={FileText}
        />
      </div>

      {/* Distribution Charts */}
      {(() => {
        const focusAreas: Record<string, number> = {};
        const locations: Record<string, number> = {};
        const sectors: Record<string, number> = {};
        for (const s of allStartups) {
          if ((s as Record<string, unknown>).focusArea) focusAreas[(s as Record<string, unknown>).focusArea as string] = (focusAreas[(s as Record<string, unknown>).focusArea as string] || 0) + 1;
          const loc = [s.city, s.state].filter(Boolean).join(", ") || "Unknown";
          locations[loc] = (locations[loc] || 0) + 1;
          sectors[s.sector] = (sectors[s.sector] || 0) + 1;
        }
        return (
          <DistributionCharts
            focusAreas={focusAreas}
            locations={locations}
            sectors={sectors}
            total={totalStartups}
          />
        );
      })()}

      {/* AI Insights */}
      <AIInsights />

      {/* Programs */}
      {programs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-brand-600" />
              Programs
            </h2>
            <Link href="/incubator/programs">
              <Button variant="ghost" size="sm">
                Manage <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const startupsInProgram = program.cohorts.reduce(
                (sum, c) => sum + c._count.startups,
                0
              );
              return (
                <Link
                  key={program.id}
                  href={`/incubator/programs/${program.id}`}
                >
                  <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.04)]">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge variant={program.isActive ? "success" : "secondary"}>
                          {program.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {program.grantor && (
                        <p className="mt-1 text-xs text-gray-500">{program.grantor}</p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>{startupsInProgram} startups</span>
                        <span>{program.cohorts.length} cohorts</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Not reported this month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Not Reported ({getMonthName(currentMonth)})
            </CardTitle>
            {notReported.length > 0 && <SendRemindersButton />}
          </CardHeader>
          <CardContent>
            {notReported.length === 0 ? (
              <p className="py-4 text-center text-sm text-green-600">
                All startups have reported this month!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notReported.map((startup) => (
                  <div
                    key={startup.id}
                    className="flex items-center justify-between rounded-lg border border-yellow-100 bg-yellow-50 p-3"
                  >
                    <div>
                      <Link
                        href={`/incubator/startups/${startup.id}`}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        {startup.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {startup.cohort.name}
                      </p>
                    </div>
                    <Badge variant="warning">Missing</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Reviews</CardTitle>
            <Link href="/incubator/reports">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingReviewReports.length === 0 ? (
              <p className="py-4 text-center text-sm text-green-600">
                All reports reviewed!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingReviewReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {report.startup.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getMonthName(report.month)} {report.year}
                      </p>
                    </div>
                    <Badge variant="default">Needs Review</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cohorts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cohorts</CardTitle>
            <Link href="/incubator/cohorts">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {cohorts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                <p>No cohorts yet.</p>
                <Link href="/incubator/cohorts">
                  <Button variant="outline" size="sm" className="mt-2">
                    Create First Cohort
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cohorts.slice(0, 5).map((cohort) => (
                  <div
                    key={cohort.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{cohort.name}</p>
                      <p className="text-xs text-gray-500">
                        {cohort._count.startups} startups
                      </p>
                    </div>
                    <Badge variant={cohort.isActive ? "success" : "secondary"}>
                      {cohort.isActive ? "Active" : "Completed"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Link href="/incubator/reports">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No reports submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {report.startup.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getMonthName(report.month)} {report.year}
                      </p>
                    </div>
                    <Badge
                      variant={
                        report.status === "SUBMITTED"
                          ? "default"
                          : report.status === "REVIEWED"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Startups Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Startups</CardTitle>
        </CardHeader>
        <CardContent>
          {allStartups.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No startups onboarded yet. Create a cohort and send invite links to
              get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Startup</th>
                    <th className="pb-3 font-medium">Cohort</th>
                    <th className="pb-3 font-medium">Stage</th>
                    <th className="pb-3 font-medium">Revenue</th>
                    <th className="pb-3 font-medium">Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {allStartups.slice(0, 15).map((startup) => (
                    <tr key={startup.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <Link
                          href={`/incubator/startups/${startup.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {startup.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {startup.founders.map((f) => f.name).join(", ")}
                        </p>
                      </td>
                      <td className="py-3">{startup.cohort.name}</td>
                      <td className="py-3">
                        <Badge variant="secondary">
                          {startup.stage.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3">{formatCurrency(startup.revenue)}</td>
                      <td className="py-3">{startup.employeesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
