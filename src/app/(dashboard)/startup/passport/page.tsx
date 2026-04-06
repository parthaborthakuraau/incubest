"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Download, Building2, MapPin, Mail, User,
  AlertTriangle, CheckCircle2, FileText, Globe,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  user: {
    id: string; name: string; email: string; photo: string | null;
    passportId: string | null; dinNumber: string | null;
  };
  activeStartup: {
    id: string; name: string; slug: string; passportId: string | null;
    sector: string; stage: string; description: string | null; logo: string | null;
    website: string | null; city: string | null; state: string | null;
    revenue: number; funding: number; employeesCount: number; customersCount: number;
    dpiitRecognized: boolean; dpiitNumber: string | null; cinNumber: string | null;
    gstNumber: string | null; panNumber: string | null;
    founders: { id: string; name: string; email: string; photo: string | null; passportId: string | null; dinNumber: string | null }[];
    ipCount: number;
    organization: { id: string; name: string; city: string | null; state: string | null; logo: string | null };
    program: { name: string; type: string; grantor: string | null } | null;
    cohort: string;
  };
  incubators: { startupId: string; organization: { name: string; logo?: string | null }; program: { name: string } | null; cohort: string }[];
  passportComplete: boolean;
  passportProgress: number;
}

export default function MyPassportPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const passportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((res) => res.json())
      .then((d) => { if (!d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading passport...</p></div>;

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No startup found</h3>
          <p className="mt-2 text-sm text-gray-500">Join an incubator to generate your passport.</p>
        </CardContent>
      </Card>
    );
  }

  const { user, activeStartup: s, incubators, passportComplete, passportProgress } = data;

  // Passport not ready
  if (!passportComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" /> My Passport
          </h1>
          <p className="text-sm text-gray-500">Complete your profile to unlock your Startup Passport</p>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-4 text-lg font-semibold">Passport Incomplete</h3>
              <p className="mt-2 text-sm text-gray-500">
                Fill in the mandatory fields to generate your passport.
              </p>
              <div className="mt-4 mx-auto max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium">{passportProgress}/8</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(passportProgress / 8) * 100}%` }} />
                </div>
              </div>
              <div className="mt-4 text-left mx-auto max-w-sm space-y-2">
                <FieldCheck done={!!s.name} label="Startup name" />
                <FieldCheck done={!!s.description} label="Description" />
                <FieldCheck done={s.sector !== "OTHER"} label="Sector" />
                <FieldCheck done={!!user.name} label="Founder name" />
                <FieldCheck done={!!user.email} label="Email" />
                <FieldCheck done={!!(s.dpiitNumber || s.panNumber || s.cinNumber)} label="DPIIT / PAN / CIN (at least one)" />
                <FieldCheck done={!!s.logo} label="Startup logo" />
                <FieldCheck done={!!user.photo} label="Founder photo" />
              </div>
              <Link href="/startup/profile">
                <Button className="mt-6">Complete Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Passport ready — show the passport card
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" /> My Passport
          </h1>
          <p className="text-sm text-gray-500">Your verified Incubest Startup Passport</p>
        </div>
        <div className="flex gap-2">
          <Link href="/startup/profile">
            <Button size="sm" variant="outline">
              Edit Details
            </Button>
          </Link>
          <Link href={`/passport/${s.slug}`} target="_blank">
            <Button size="sm">
              <Globe className="mr-1 h-3.5 w-3.5" /> View Full Passport
            </Button>
          </Link>
        </div>
      </div>

      {/* Passport Card */}
      <div ref={passportRef}>
        <Card className="border-2 border-emerald-200 overflow-hidden shadow-lg shadow-emerald-500/10">
          {/* Header stripe — gradient */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/dark.svg" alt="Incubest" className="h-7 w-7 invert" />
              <span className="text-white font-bold text-sm tracking-wider">INCUBEST STARTUP PASSPORT</span>
            </div>
            <div className="flex items-center gap-2">
              {s.organization.logo && <img src={s.organization.logo} alt="" className="h-7 w-7 rounded-lg object-cover border border-white/20" />}
              <span className="text-white/70 text-xs">{s.organization.name}</span>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left: Founders */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Founders</h3>
                {s.founders.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 mb-3">
                    {f.photo ? (
                      <img src={f.photo} alt={f.name} className="h-14 w-14 rounded-lg object-cover border" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-50 border">
                        <User className="h-6 w-6 text-brand-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-xs text-gray-500">{f.email}</p>
                      {f.passportId && (
                        <p className="text-[10px] font-mono text-brand-600">{f.passportId}</p>
                      )}
                      {f.dinNumber && (
                        <p className="text-[10px] text-gray-400">DIN: {f.dinNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Startup */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Startup</h3>
                <div className="flex items-center gap-3 mb-3">
                  {s.logo ? (
                    <img src={s.logo} alt={s.name} className="h-14 w-14 rounded-lg object-cover border" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 border">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{s.name}</p>
                    <div className="flex gap-1">
                      <Badge variant="secondary">{s.sector.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">{s.stage.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                </div>
                {s.passportId && (
                  <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3 inline-block">
                    <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Passport ID</p>
                    <p className="text-xl font-mono font-bold text-emerald-700">{s.passportId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Details */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Registration</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {s.dpiitNumber && <RegField label="DPIIT" value={s.dpiitNumber} />}
                {s.cinNumber && <RegField label="CIN" value={s.cinNumber} />}
                {s.panNumber && <RegField label="PAN" value={s.panNumber} />}
                {s.gstNumber && <RegField label="GST" value={s.gstNumber} />}
                <RegField label="Email" value={user.email} />
                {user.dinNumber && <RegField label="DIN" value={user.dinNumber} />}
              </div>
            </div>

            {/* Incubators */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Incubator Associations ({incubators.length})
              </h3>
              <div className="space-y-3">
                {incubators.map((inc) => (
                  <div key={inc.startupId} className="flex items-center gap-3">
                    {inc.organization.logo ? (
                      <img src={inc.organization.logo} alt="" className="h-8 w-8 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500">
                        {inc.organization.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{inc.organization.name}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {inc.program && <span className="text-[10px] text-gray-500">{inc.program.name}</span>}
                        <span className="text-[10px] text-gray-400">{inc.cohort}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Metrics</h3>
              <div className="grid gap-3 sm:grid-cols-4">
                <MetricBox label="Revenue" value={formatCurrency(s.revenue)} />
                <MetricBox label="Funding" value={formatCurrency(s.funding)} />
                <MetricBox label="Employees" value={String(s.employeesCount)} />
                <MetricBox label="IPs Filed" value={String(s.ipCount)} />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t pt-4 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">
                Generated by Incubest — The OS for Incubators
              </p>
              <p className="text-[10px] text-gray-400">
                {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FieldCheck({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
      )}
      <span className={done ? "text-gray-700" : "text-gray-400"}>{label}</span>
    </div>
  );
}

function RegField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-sm font-mono font-medium">{value}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 p-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
