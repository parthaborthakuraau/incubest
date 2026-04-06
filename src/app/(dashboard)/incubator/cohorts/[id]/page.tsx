import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, TrendingUp, FileText, Building2 } from "lucide-react";
import Link from "next/link";
import { InviteButton } from "@/components/dashboard/invite-button";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const cohort = await db.cohort.findUnique({
    where: { id, organizationId: session.user.organizationId! },
    include: {
      startups: {
        include: {
          founders: { select: { name: true, email: true } },
          _count: { select: { reports: true } },
        },
      },
    },
  });

  if (!cohort) notFound();

  const totalEmployees = cohort.startups.reduce(
    (sum, s) => sum + s.employeesCount,
    0
  );
  const totalRevenue = cohort.startups.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
          {cohort.description && (
            <p className="text-sm text-gray-500">{cohort.description}</p>
          )}
        </div>
        {/* Invite happens inside Program → Cohort detail */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Startups" value={cohort.startups.length} icon={Building2} />
        <StatCard title="Jobs Created" value={totalEmployees} icon={Users} />
        <StatCard
          title="Total Revenue"
          value={`₹${Math.round(totalRevenue / 100000)}L`}
          icon={TrendingUp}
        />
        <StatCard
          title="Reports"
          value={cohort.startups.reduce((sum, s) => sum + s._count.reports, 0)}
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Startups in {cohort.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {cohort.startups.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No startups in this cohort yet. Send an invite link to onboard startups.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Startup</th>
                    <th className="pb-3 font-medium">Founders</th>
                    <th className="pb-3 font-medium">Stage</th>
                    <th className="pb-3 font-medium">Sector</th>
                    <th className="pb-3 font-medium">Employees</th>
                    <th className="pb-3 font-medium">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {cohort.startups.map((startup) => (
                    <tr key={startup.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <Link
                          href={`/incubator/startups/${startup.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {startup.name}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-500">
                        {startup.founders.map((f) => f.name).join(", ")}
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary">
                          {startup.stage.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3">{startup.sector.replace("_", " ")}</td>
                      <td className="py-3">{startup.employeesCount}</td>
                      <td className="py-3">{startup._count.reports}</td>
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
