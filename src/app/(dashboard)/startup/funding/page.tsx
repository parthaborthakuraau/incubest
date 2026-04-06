import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { IndianRupee, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function StartupFundingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    redirect("/login");
  }

  const startup = await db.startup.findFirst({
    where: { founders: { some: { id: session.user.id } } },
    include: {
      funds: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!startup) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No startup found for your account.</p>
      </div>
    );
  }

  const totalFunding = startup.funds.reduce((sum, f) => sum + f.amount, 0);
  const disbursed = startup.funds.filter((f) => f.status === "DISBURSED" || f.status === "UTILIZED");
  const disbursedAmount = disbursed.reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = startup.funds.filter((f) => f.status === "PENDING").reduce((sum, f) => sum + f.amount, 0);
  const utilized = startup.funds.filter((f) => f.status === "UTILIZED");
  const utilizedAmount = utilized.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Funding</h1>
        <p className="text-sm text-gray-500">
          Track your fund disbursements and utilization
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Allocated"
          value={formatCurrency(totalFunding)}
          icon={IndianRupee}
        />
        <StatCard
          title="Disbursed"
          value={formatCurrency(disbursedAmount)}
          icon={CheckCircle}
        />
        <StatCard
          title="Pending"
          value={formatCurrency(pendingAmount)}
          icon={Clock}
        />
        <StatCard
          title="Utilized"
          value={formatCurrency(utilizedAmount)}
          icon={TrendingUp}
        />
      </div>

      {startup.funds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IndianRupee className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No funds allocated yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Fund disbursements from your incubator will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fund Disbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Fund</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Disbursed On</th>
                    <th className="pb-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {startup.funds.map((fund) => (
                    <tr key={fund.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{fund.name}</td>
                      <td className="py-3">{formatCurrency(fund.amount)}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            fund.status === "DISBURSED"
                              ? "success"
                              : fund.status === "UTILIZED"
                              ? "default"
                              : "warning"
                          }
                        >
                          {fund.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        {fund.disbursedAt
                          ? formatDate(fund.disbursedAt)
                          : "—"}
                      </td>
                      <td className="py-3 text-gray-500 max-w-xs truncate">
                        {fund.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
