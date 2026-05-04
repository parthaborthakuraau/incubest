import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2, Users, TrendingUp, IndianRupee, Lightbulb,
  MapPin, Globe, Calendar, Award, Briefcase, Zap,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function StartupPassport({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const startup = await db.startup.findUnique({
    where: { slug },
    include: {
      cohort: {
        include: {
          organization: { select: { name: true, city: true, state: true, type: true } },
          program: { select: { name: true, type: true, grantor: true } },
        },
      },
      founders: { select: { name: true } },
      intellectualProperties: { select: { title: true, type: true, status: true } },
      _count: { select: { reports: true, funds: true, jobRecords: true, socialImpacts: true } },
    },
  });

  if (!startup) notFound();

  const org = startup.cohort.organization;
  const program = startup.cohort.program;

  // Find ALL incubations for this founder (multi-incubator support)
  const founderEmails = startup.founders.map(f => f.name); // name is loaded, email below
  const founderUsers = await db.user.findMany({
    where: {
      startups: { some: { id: startup.id } },
      role: "STARTUP_FOUNDER",
    },
    select: { email: true },
  });

  // Get all startups linked to these founders (across all incubators)
  const allLinkedStartups = founderUsers.length > 0
    ? await db.startup.findMany({
        where: {
          founders: { some: { email: { in: founderUsers.map(u => u.email) } } },
        },
        include: {
          cohort: {
            include: {
              organization: { select: { name: true, city: true, state: true } },
              program: { select: { name: true, grantor: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const incubationHistory = allLinkedStartups.map(s => ({
    startupName: s.name,
    orgName: s.cohort.organization.name,
    orgCity: s.cohort.organization.city,
    orgState: s.cohort.organization.state,
    programName: s.cohort.program?.name,
    grantor: s.cohort.program?.grantor,
    cohortName: s.cohort.name,
    isCurrent: s.id === startup.id,
    passportId: s.passportId,
    slug: s.slug,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold">Incubest</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Startup Passport</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{startup.name}</h1>
                {startup.passportId && (
                  <div className="rounded-lg border-2 border-brand-200 bg-brand-50 px-3 py-1">
                    <p className="text-[10px] font-medium text-brand-500 uppercase tracking-wider">Passport</p>
                    <p className="text-sm font-mono font-bold text-brand-700">{startup.passportId}</p>
                  </div>
                )}
              </div>
              {startup.description && (
                <p className="mt-2 text-gray-600 max-w-2xl">{startup.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{startup.sector.replace(/_/g, " ")}</Badge>
                <Badge variant="outline">{startup.stage.replace(/_/g, " ")}</Badge>
                {startup.dpiitRecognized && <Badge>DPIIT Recognized</Badge>}
                {startup.isWomenLed && <Badge variant="outline">Women-Led</Badge>}
                {startup.alumniStatus !== "ACTIVE" && (
                  <Badge variant={startup.alumniStatus === "GRADUATED" ? "success" : "secondary"}>
                    {startup.alumniStatus.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Key metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={TrendingUp} label="Revenue" value={formatCurrency(startup.revenue)} />
          <MetricCard icon={IndianRupee} label="Funding" value={formatCurrency(startup.funding)} />
          <MetricCard icon={Users} label="Employees" value={startup.employeesCount} />
          <MetricCard icon={Building2} label="Customers" value={startup.customersCount} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* About */}
          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Building2} label="Founders" value={startup.founders.map((f) => f.name).join(", ")} />
              {(startup.city || startup.state) && (
                <InfoRow icon={MapPin} label="Location" value={[startup.city, startup.state].filter(Boolean).join(", ")} />
              )}
              {startup.website && (
                <InfoRow icon={Globe} label="Website" value={startup.website} link />
              )}
              {startup.foundedDate && (
                <InfoRow icon={Calendar} label="Founded" value={formatDate(startup.foundedDate)} />
              )}
              {startup.founderCategory && (
                <InfoRow icon={Users} label="Founder Category" value={startup.founderCategory.toUpperCase()} />
              )}
              {startup.isRural && (
                <InfoRow icon={MapPin} label="Rural Startup" value="Yes" />
              )}
            </CardContent>
          </Card>

          {/* Incubation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Incubation History ({incubationHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incubationHistory.map((inc, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${inc.isCurrent ? "border-emerald-200 bg-emerald-50" : "border-gray-100"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{inc.orgName}</p>
                    {inc.isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {inc.orgCity && (
                    <p className="text-xs text-gray-500">{[inc.orgCity, inc.orgState].filter(Boolean).join(", ")}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {inc.programName && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {inc.programName}{inc.grantor ? ` (${inc.grantor})` : ""}
                      </span>
                    )}
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {inc.cohortName}
                    </span>
                  </div>
                  {!inc.isCurrent && inc.slug && (
                    <Link href={`/passport/${inc.slug}`} className="text-xs text-brand-600 hover:underline mt-2 inline-block">
                      View passport
                    </Link>
                  )}
                </div>
              ))}
              <InfoRow icon={Calendar} label="Reports Submitted" value={String(startup._count.reports)} />
            </CardContent>
          </Card>
        </div>

        {/* Registration details */}
        {(startup.dpiitNumber || startup.cinNumber || startup.gstNumber || startup.panNumber) && (
          <Card>
            <CardHeader><CardTitle>Registration Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {startup.dpiitNumber && <RegDetail label="DPIIT No." value={startup.dpiitNumber} />}
                {startup.cinNumber && <RegDetail label="CIN" value={startup.cinNumber} />}
                {startup.gstNumber && <RegDetail label="GST" value={startup.gstNumber} />}
                {startup.panNumber && <RegDetail label="PAN" value={startup.panNumber} />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Intellectual Property */}
        {startup.intellectualProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Intellectual Property ({startup.intellectualProperties.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {startup.intellectualProperties.map((ip, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{ip.title}</p>
                      <Badge variant="outline" className="mt-1">{ip.type}</Badge>
                    </div>
                    <Badge variant={ip.status === "GRANTED" ? "success" : ip.status === "FILED" ? "default" : "secondary"}>
                      {ip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400">
            Startup Passport powered by{" "}
            <Link href="/" className="text-brand-600 hover:underline">Incubest</Link>
            {" "}&middot; The OS for Incubators
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ──────────────────────────────────

function MetricCard({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value, link }: { icon: typeof Building2; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

function RegDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-mono font-medium">{value}</p>
    </div>
  );
}
