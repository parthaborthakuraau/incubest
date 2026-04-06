import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Users,
  TrendingUp,
  FileText,
  Target,
  Globe,
  MapPin,
  IndianRupee,
  Lightbulb,
  Calendar,
  Award,
  Briefcase,
  Heart,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import Link from "next/link";
import { FundingGraduation } from "@/components/dashboard/funding-graduation";

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  // Try to find by ID first, then by slug
  let startup = await db.startup.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      cohort: { organizationId: session.user.organizationId! },
    },
    include: {
      cohort: { select: { name: true } },
      founders: { select: { name: true, email: true, phone: true } },
      reports: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 12,
        include: { template: { select: { name: true } } },
      },
      milestones: {
        include: { template: true },
        orderBy: { dueDate: "asc" },
      },
      funds: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      mentorSessions: {
        include: { mentor: { select: { user: { select: { name: true } } } } },
        orderBy: { date: "desc" },
        take: 10,
      },
      intellectualProperties: { orderBy: { createdAt: "desc" } },
      awards: { orderBy: { date: "desc" } },
      jobRecords: { include: { category: true }, orderBy: { createdAt: "desc" }, take: 20 },
      socialImpacts: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: {
        select: { reports: true, mentorSessions: true, documents: true, awards: true, jobRecords: true, socialImpacts: true },
      },
    },
  });

  if (!startup) notFound();

  const completedMilestones = startup.milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/incubator/cohorts/${startup.cohortId}`}
          className="text-sm text-brand-600 hover:underline"
        >
          &larr; {startup.cohort.name}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{startup.name}</h1>
          {startup.passportId && (
            <Link href={`/passport/${startup.slug}`} target="_blank">
              <Badge variant="default" className="font-mono">{startup.passportId}</Badge>
            </Link>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{startup.stage.replace(/_/g, " ")}</Badge>
          <Badge variant="outline">{startup.sector.replace(/_/g, " ")}</Badge>
          {startup.isWomenLed && <Badge variant="success">Women-Led</Badge>}
          {startup.isRural && <Badge variant="warning">Rural</Badge>}
          {startup.dpiitRecognized && <Badge variant="default">DPIIT</Badge>}
        </div>
      </div>

      {startup.description && (
        <p className="text-sm text-gray-600">{startup.description}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Employees"
          value={startup.employeesCount}
          icon={Users}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(startup.revenue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Reports"
          value={startup._count.reports}
          icon={FileText}
        />
        <StatCard
          title="Milestones"
          value={`${completedMilestones}/${startup.milestones.length}`}
          icon={Target}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {startup.website && (
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Globe className="h-4 w-4 text-gray-400" />
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline"
              >
                {startup.website}
              </a>
            </CardContent>
          </Card>
        )}
        {(startup.city || startup.state) && (
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {[startup.city, startup.state].filter(Boolean).join(", ")}
              </span>
            </CardContent>
          </Card>
        )}
        {startup.foundedDate && (
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                Founded {formatDate(startup.foundedDate)}
              </span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Funding Graduation */}
      <FundingGraduation
        startupId={startup.id}
        startupName={startup.name}
        currentStatus={(startup as Record<string, unknown>).fundingStatus as string || "INCUBATED"}
        grantAmount={(startup as Record<string, unknown>).grantAmount as number | null}
        grantDate={(startup as Record<string, unknown>).grantDate ? String((startup as Record<string, unknown>).grantDate) : null}
        grantReference={(startup as Record<string, unknown>).grantReference as string | null}
        grantSource={(startup as Record<string, unknown>).grantSource as string | null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Founders */}
        <Card>
          <CardHeader>
            <CardTitle>Founders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {startup.founders.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.email}</p>
                  </div>
                  {f.phone && (
                    <span className="text-sm text-gray-500">{f.phone}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Link href="/incubator/reports" className="text-xs text-blue-600 hover:underline">View All &rarr;</Link>
          </CardHeader>
          <CardContent>
            {startup.reports.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No reports submitted yet.
              </p>
            ) : (
              <div className="space-y-4">
                {startup.reports.map((report) => {
                  const data = report.data as Record<string, unknown>;
                  return (
                    <details
                      key={report.id}
                      className="rounded-lg border border-gray-100"
                    >
                      <summary className="flex cursor-pointer items-center justify-between p-3">
                        <span className="text-sm font-medium">
                          {getMonthName(report.month)} {report.year}
                        </span>
                        <Badge
                          variant={
                            report.status === "REVIEWED"
                              ? "success"
                              : report.status === "SUBMITTED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {report.status}
                        </Badge>
                      </summary>
                      <div className="border-t border-gray-100 p-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          {Object.entries(data).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-xs text-gray-500">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                              </p>
                              <p className="text-sm font-medium whitespace-pre-wrap">
                                {typeof value === "number"
                                  ? value.toLocaleString("en-IN")
                                  : String(value || "—")}
                              </p>
                            </div>
                          ))}
                        </div>
                        {report.submittedAt && (
                          <p className="mt-3 text-xs text-gray-400">
                            Submitted {formatDate(report.submittedAt)}
                          </p>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {startup.milestones.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No milestones set.
              </p>
            ) : (
              <div className="space-y-2">
                {startup.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{m.template.name}</p>
                      {m.dueDate && (
                        <p className="text-xs text-gray-500">
                          Due {formatDate(m.dueDate)}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        m.status === "COMPLETED"
                          ? "success"
                          : m.status === "IN_PROGRESS"
                          ? "warning"
                          : m.status === "MISSED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {m.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fund Disbursements */}
        <Card>
          <CardHeader>
            <CardTitle>Funding</CardTitle>
          </CardHeader>
          <CardContent>
            {startup.funds.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No funds allocated.
              </p>
            ) : (
              <div className="space-y-2">
                {startup.funds.map((fund) => (
                  <div
                    key={fund.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{fund.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(fund.amount)}
                      </p>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* IP */}
        {startup.intellectualProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {startup.intellectualProperties.map((ip) => (
                  <div
                    key={ip.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{ip.title}</p>
                      <Badge variant="outline">{ip.type}</Badge>
                    </div>
                    <Badge
                      variant={
                        ip.status === "GRANTED"
                          ? "success"
                          : ip.status === "FILED"
                          ? "warning"
                          : ip.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {ip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mentor Sessions */}
        {startup.mentorSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Mentor Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {startup.mentorSessions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {s.mentor.user.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(s.date)} &middot; {s.duration} min
                      </span>
                    </div>
                    {s.notes && (
                      <p className="mt-1 text-xs text-gray-500">{s.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {startup.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {startup.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <Badge variant="outline">{doc.type.replace(/_/g, " ")}</Badge>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Awards */}
      {startup.awards.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-4 w-4" /> Awards & Recognition ({startup.awards.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {startup.awards.map((a: { id: string; title: string; description: string | null; date: Date | null; image: string | null; socialUrl: string | null }) => (
                <div key={a.id} className="rounded-lg border p-3">
                  {a.image && <img src={a.image} alt={a.title} className="mb-2 h-24 w-full rounded object-cover" />}
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    {a.date && <span className="text-xs text-gray-400">{formatDate(a.date)}</span>}
                    {a.socialUrl && <a href={a.socialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 flex items-center gap-1"><ExternalLink className="h-3 w-3" />Post</a>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs & Social Impact */}
      {(startup.jobRecords.length > 0 || startup.socialImpacts.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {startup.jobRecords.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Jobs Created ({startup._count.jobRecords})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {startup.jobRecords.map((j: { id: string; count: number; month: number; year: number; category: { name: string; type: string } }) => (
                    <div key={j.id} className="flex items-center justify-between rounded-lg border p-2">
                      <div><p className="text-sm font-medium">{j.category.name}</p><p className="text-xs text-gray-400">{getMonthName(j.month)} {j.year}</p></div>
                      <Badge variant="outline">{j.count} {j.category.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {startup.socialImpacts.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-4 w-4" /> Social Impact ({startup._count.socialImpacts})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {startup.socialImpacts.map((s: { id: string; metricName: string; value: number; unit: string; month: number; year: number }) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border p-2">
                      <div><p className="text-sm font-medium">{s.metricName.replace(/_/g, " ")}</p><p className="text-xs text-gray-400">{getMonthName(s.month)} {s.year}</p></div>
                      <Badge variant="outline">{s.value.toLocaleString("en-IN")} {s.unit}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs text-gray-500">DPIIT</p>
              <p className="text-sm font-medium">
                {startup.dpiitRecognized ? startup.dpiitNumber || "Yes" : "No"}
              </p>
            </div>
            {startup.cinNumber && (
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">CIN</p>
                <p className="text-sm font-medium">{startup.cinNumber}</p>
              </div>
            )}
            {startup.gstNumber && (
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">GST</p>
                <p className="text-sm font-medium">{startup.gstNumber}</p>
              </div>
            )}
            {startup.panNumber && (
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">PAN</p>
                <p className="text-sm font-medium">{startup.panNumber}</p>
              </div>
            )}
            {startup.founderCategory && (
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium">
                  {startup.founderCategory.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
