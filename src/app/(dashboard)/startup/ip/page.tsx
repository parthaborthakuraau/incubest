"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  ShieldCheck,
  Plus,
  X,
  FileText,
  Award,
  BookOpen,
} from "lucide-react";

interface IP {
  id: string;
  title: string;
  type: "PATENT" | "TRADEMARK" | "COPYRIGHT" | "DESIGN";
  status: "FILED" | "PUBLISHED" | "GRANTED" | "REJECTED" | "EXPIRED";
  applicationNo: string | null;
  filedDate: string | null;
  grantedDate: string | null;
  description: string | null;
  createdAt: string;
}

const ipTypes = [
  { value: "PATENT", label: "Patent" },
  { value: "TRADEMARK", label: "Trademark" },
  { value: "COPYRIGHT", label: "Copyright" },
  { value: "DESIGN", label: "Design" },
];

const ipStatuses = [
  { value: "FILED", label: "Filed" },
  { value: "PUBLISHED", label: "Published" },
  { value: "GRANTED", label: "Granted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
];

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  FILED: "warning",
  PUBLISHED: "default",
  GRANTED: "success",
  REJECTED: "destructive",
  EXPIRED: "secondary",
};

export default function StartupIPPage() {
  const [ips, setIps] = useState<IP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIPs();
  }, []);

  async function fetchIPs() {
    const res = await fetch("/api/ip");
    if (res.ok) {
      const data = await res.json();
      setIps(data);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get("title"),
      type: formData.get("type"),
      applicationNo: formData.get("applicationNo"),
      filedDate: formData.get("filedDate") || null,
      description: formData.get("description"),
    };

    const res = await fetch("/api/ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      fetchIPs();
    }
    setSubmitting(false);
  }

  async function handleStatusUpdate(id: string, newStatus: string) {
    setUpdatingId(id);

    const body: { id: string; status: string; grantedDate?: string } = {
      id,
      status: newStatus,
    };

    if (newStatus === "GRANTED") {
      body.grantedDate = new Date().toISOString();
    }

    const res = await fetch("/api/ip", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fetchIPs();
    }
    setUpdatingId(null);
  }

  const totalIPs = ips.length;
  const patentsFiled = ips.filter((ip) => ip.type === "PATENT").length;
  const patentsGranted = ips.filter(
    (ip) => ip.type === "PATENT" && ip.status === "GRANTED"
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading IP records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IP & Patents</h1>
          <p className="text-sm text-gray-500">
            Track and manage your intellectual property filings
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Add IP
            </>
          )}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total IPs" value={totalIPs} icon={ShieldCheck} />
        <StatCard title="Patents Filed" value={patentsFiled} icon={FileText} />
        <StatCard title="Patents Granted" value={patentsGranted} icon={Award} />
      </div>

      {/* Add IP Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                label="Title"
                name="title"
                placeholder="e.g. Smart Irrigation System"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {ipTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Application Number"
                name="applicationNo"
                placeholder="e.g. IN202341012345"
              />
              <Input label="Filed Date" name="filedDate" type="date" />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of the intellectual property"
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                <BookOpen className="mr-2 h-4 w-4" />
                {submitting ? "Adding..." : "Add IP"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* IP List */}
      {ips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No IP records yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add your patents, trademarks, copyrights, and designs to track
              their status.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              All IP Records
              <Badge variant="secondary" className="ml-2">
                {ips.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ips.map((ip) => (
                <div
                  key={ip.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{ip.title}</p>
                      <Badge variant="outline">
                        {ipTypes.find((t) => t.value === ip.type)?.label ||
                          ip.type}
                      </Badge>
                      <Badge variant={statusVariantMap[ip.status] || "default"}>
                        {ip.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {ip.applicationNo && (
                        <span>Application: {ip.applicationNo}</span>
                      )}
                      {ip.filedDate && (
                        <span>
                          Filed:{" "}
                          {new Date(ip.filedDate).toLocaleDateString("en-IN")}
                        </span>
                      )}
                      {ip.grantedDate && (
                        <span>
                          Granted:{" "}
                          {new Date(ip.grantedDate).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>
                    {ip.description && (
                      <p className="text-xs text-gray-500">{ip.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <select
                      value={ip.status}
                      onChange={(e) =>
                        handleStatusUpdate(ip.id, e.target.value)
                      }
                      disabled={updatingId === ip.id}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {ipStatuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
