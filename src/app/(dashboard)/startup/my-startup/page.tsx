"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2, FileText, FolderOpen, IndianRupee, Lightbulb,
  Briefcase, Heart, Award, Plus, X, Trash2, ExternalLink,
  Upload, TrendingUp, Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "funding", label: "Funding", icon: IndianRupee },
  { id: "ip", label: "IP & Patents", icon: Lightbulb },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "impact", label: "Social Impact", icon: Heart },
  { id: "awards", label: "Awards", icon: Award },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MyStartupPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.activeStartup) setStartup(d.activeStartup); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!startup) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">No startup found</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{startup.name}</h1>
        <p className="text-sm text-gray-500">{startup.organization.name} &middot; {startup.cohort}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewSection startup={startup} />}
      {activeTab === "documents" && <DocumentsSection />}
      {activeTab === "funding" && <FundingSection />}
      {activeTab === "ip" && <IPSection />}
      {activeTab === "jobs" && <JobsSection />}
      {activeTab === "impact" && <ImpactSection />}
      {activeTab === "awards" && <AwardsSection />}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OverviewSection({ startup }: { startup: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Revenue</p><p className="text-2xl font-bold mt-1">{formatCurrency(startup.revenue)}</p></CardContent></Card>
      <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Funding</p><p className="text-2xl font-bold mt-1">{formatCurrency(startup.funding)}</p></CardContent></Card>
      <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Employees</p><p className="text-2xl font-bold mt-1">{startup.employeesCount}</p></CardContent></Card>
      <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Customers</p><p className="text-2xl font-bold mt-1">{startup.customersCount}</p></CardContent></Card>
    </div>
  );
}

function DocumentsSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [docs, setDocs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch("/api/documents").then((r) => r.json()).then(setDocs); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    let url = fd.get("url") as string;
    if (fileInput?.files?.[0]) {
      const uf = new FormData(); uf.append("file", fileInput.files[0]);
      const ur = await fetch("/api/upload", { method: "POST", body: uf });
      if (ur.ok) { url = (await ur.json()).url; }
    }
    await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), type: fd.get("type"), url }) });
    setShowForm(false); setSubmitting(false);
    fetch("/api/documents").then((r) => r.json()).then(setDocs);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Plus className="mr-2 h-4 w-4" />Add Document</>}</Button></div>
      {showForm && (
        <Card><CardContent className="p-4"><form onSubmit={handleAdd} className="space-y-3">
          <Input label="Name" name="name" required />
          <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Type</label>
            <select name="type" required className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
              {["pitch_deck","incorporation_cert","dpiit_cert","gst_cert","patent","financial_statement","mou","product_doc","other"].map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select></div>
          <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700" />
          <Input label="Or paste URL" name="url" placeholder="https://..." />
          <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add"}</Button>
        </form></CardContent></Card>
      )}
      {docs.length === 0 ? <Card><CardContent className="py-8 text-center text-sm text-gray-500">No documents yet</CardContent></Card> : (
        <div className="space-y-2">{docs.map((d: { id: string; name: string; type: string; url: string; createdAt: string }) => (
          <Card key={d.id}><CardContent className="flex items-center justify-between p-3">
            <div><p className="text-sm font-medium">{d.name}</p><Badge variant="outline">{d.type.replace(/_/g, " ")}</Badge></div>
            <div className="flex gap-2">
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded"><ExternalLink className="h-4 w-4 text-gray-500" /></a>
              <button onClick={async () => { await fetch(`/api/documents?id=${d.id}`, { method: "DELETE" }); fetch("/api/documents").then((r) => r.json()).then(setDocs); }} className="p-1 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}

function FundingSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [startup, setStartup] = useState<any>(null);
  useEffect(() => {
    fetch("/api/startup/dashboard").then(r => r.json()).then(d => {
      if (d.activeStartup) setStartup(d.activeStartup);
    });
  }, []);

  if (!startup) return <p className="text-sm text-gray-500">Loading...</p>;

  const isFunded = startup.fundingStatus === "FUNDED" || startup.fundingStatus === "GRADUATED";

  return (
    <div className="space-y-4">
      {/* Funding status badge */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isFunded ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
          {startup.fundingStatus || "INCUBATED"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Total Funding Raised</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(startup.funding || 0)}</p></CardContent></Card>
        {startup.grantAmount && (
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Grant from Incubator</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(startup.grantAmount)}</p></CardContent></Card>
        )}
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Revenue</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(startup.revenue || 0)}</p></CardContent></Card>
      </div>

      {/* Grant details if funded */}
      {isFunded && startup.grantAmount && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Grant Details</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-500">Amount</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(startup.grantAmount)}</p>
              </div>
              {startup.grantDate && (
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[10px] text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(startup.grantDate).toLocaleDateString("en-IN")}</p>
                </div>
              )}
              {startup.grantReference && (
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[10px] text-gray-500">Reference</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{startup.grantReference}</p>
                </div>
              )}
              {startup.grantSource && (
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[10px] text-gray-500">Source</p>
                  <p className="text-sm font-medium text-gray-900">{startup.grantSource}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isFunded && (
        <p className="text-sm text-gray-500">Fund disbursements from your incubator will appear here once you are funded.</p>
      )}
    </div>
  );
}

function IPSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ips, setIps] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch("/api/ip").then((r) => r.json()).then(setIps); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/ip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: fd.get("title"), type: fd.get("type"), applicationNo: fd.get("applicationNo"), description: fd.get("description") }) });
    setShowForm(false); setSubmitting(false);
    fetch("/api/ip").then((r) => r.json()).then(setIps);
  }

  const STATUS_COLORS: Record<string, "secondary" | "default" | "success" | "warning"> = { FILED: "default", PUBLISHED: "secondary", GRANTED: "success", REJECTED: "warning", EXPIRED: "secondary" };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Plus className="mr-2 h-4 w-4" />Add IP</>}</Button></div>
      {showForm && (
        <Card><CardContent className="p-4"><form onSubmit={handleAdd} className="space-y-3">
          <Input label="Title" name="title" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Type</label>
              <select name="type" required className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="PATENT">Patent</option><option value="TRADEMARK">Trademark</option><option value="COPYRIGHT">Copyright</option><option value="DESIGN">Design</option>
              </select></div>
            <Input label="Application No." name="applicationNo" />
          </div>
          <Input label="Description" name="description" />
          <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add"}</Button>
        </form></CardContent></Card>
      )}
      {ips.length === 0 ? <Card><CardContent className="py-8 text-center text-sm text-gray-500">No intellectual property filed yet</CardContent></Card> : (
        <div className="space-y-2">{ips.map((ip: { id: string; title: string; type: string; status: string; applicationNo: string | null }) => (
          <Card key={ip.id}><CardContent className="flex items-center justify-between p-3">
            <div><p className="text-sm font-medium">{ip.title}</p><div className="flex gap-1 mt-1"><Badge variant="outline">{ip.type}</Badge>{ip.applicationNo && <Badge variant="outline">{ip.applicationNo}</Badge>}</div></div>
            <Badge variant={STATUS_COLORS[ip.status]}>{ip.status}</Badge>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}

function JobsSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => { fetch("/api/jobs").then(r => r.json()).then(d => { if (Array.isArray(d)) setJobs(d); }); }, []);

  const total = jobs.reduce((s: number, j: { count: number }) => s + j.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Jobs created by your startup</p>
        <span className="text-lg font-bold text-gray-900">{total} total</span>
      </div>
      {jobs.length === 0 ? (
        <Card><CardContent className="py-8 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No job records yet. Log employment data in your monthly reports.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((j: { id: string; count: number; month: number; year: number; category?: { name: string; type: string } }) => (
            <Card key={j.id}><CardContent className="flex items-center justify-between p-3">
              <div><p className="text-sm font-medium text-gray-900">{j.category?.name || "Jobs"}</p><p className="text-xs text-gray-500">{["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][j.month]} {j.year}</p></div>
              <Badge variant="outline">{j.count} {j.category?.type || "direct"}</Badge>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ImpactSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [impacts, setImpacts] = useState<any[]>([]);
  useEffect(() => { fetch("/api/social-impact").then(r => r.json()).then(d => { if (Array.isArray(d)) setImpacts(d); }); }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Social impact metrics from your startup</p>
      {impacts.length === 0 ? (
        <Card><CardContent className="py-8 text-center">
          <Heart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No impact data yet. Log social impact in your monthly reports.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {impacts.map((si: { id: string; metricName: string; value: number; unit: string; month: number; year: number }) => (
            <Card key={si.id}><CardContent className="p-4">
              <p className="text-2xl font-bold text-gray-900">{si.value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500">{si.metricName.replace(/_/g, " ")} ({si.unit})</p>
              <p className="text-[10px] text-gray-400">{["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][si.month]} {si.year}</p>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AwardsSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [awards, setAwards] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch("/api/awards").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setAwards(d); }); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    let imageUrl: string | null = null;
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const uf = new FormData(); uf.append("file", fileInput.files[0]);
      const ur = await fetch("/api/upload", { method: "POST", body: uf });
      if (ur.ok) imageUrl = (await ur.json()).url;
    }

    await fetch("/api/awards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: fd.get("title"), description: fd.get("description"), date: fd.get("date") || null, image: imageUrl, socialUrl: fd.get("socialUrl") || null }) });
    setShowForm(false); setSubmitting(false);
    fetch("/api/awards").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setAwards(d); });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Plus className="mr-2 h-4 w-4" />Add Award</>}</Button></div>
      {showForm && (
        <Card><CardContent className="p-4"><form onSubmit={handleAdd} className="space-y-3">
          <Input label="Award Title *" name="title" placeholder="e.g. Best AgriTech Startup 2026" required />
          <Input label="Description" name="description" placeholder="Who gave it, why" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Date" name="date" type="date" />
            <Input label="Social Media URL" name="socialUrl" placeholder="https://linkedin.com/..." />
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Photo/Certificate</label>
            <input type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700" /></div>
          <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Award"}</Button>
        </form></CardContent></Card>
      )}
      {awards.length === 0 && !showForm ? <Card><CardContent className="py-8 text-center"><Award className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 text-sm text-gray-500">No awards yet. Add your achievements and recognitions.</p></CardContent></Card> : (
        <div className="grid gap-3 md:grid-cols-2">{awards.map((a: { id: string; title: string; description: string | null; date: string | null; image: string | null; socialUrl: string | null }) => (
          <Card key={a.id}><CardContent className="p-4">
            {a.image && <img src={a.image} alt={a.title} className="mb-3 h-32 w-full rounded-lg object-cover" />}
            <p className="font-semibold">{a.title}</p>
            {a.description && <p className="mt-0.5 text-sm text-gray-500">{a.description}</p>}
            <div className="mt-2 flex items-center gap-3">
              {a.date && <span className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString("en-IN")}</span>}
              {a.socialUrl && <a href={a.socialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />View post</a>}
              <button onClick={async () => { await fetch(`/api/awards?id=${a.id}`, { method: "DELETE" }); fetch("/api/awards").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setAwards(d); }); }} className="ml-auto text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
