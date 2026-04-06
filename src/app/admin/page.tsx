"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, FileText, FolderKanban, ShoppingBag,
  GraduationCap, BarChart3, Target,
} from "lucide-react";
import Link from "next/link";

interface OrgData {
  id: string; name: string; slug: string; city: string | null; state: string | null;
  type: string | null; createdAt: string;
  _count: { admins: number; cohorts: number; programs: number };
}

interface UserData {
  id: string; name: string; email: string; role: string; createdAt: string;
}

interface AdminData {
  stats: {
    totalOrgs: number; totalUsers: number; totalStartups: number; totalPrograms: number;
    totalReports: number; totalMentors: number; totalForms: number; totalServices: number;
  };
  orgs: OrgData[];
  recentUsers: UserData[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin").then(r => {
      if (r.status === 401) { setError("Access denied. Super Admin only."); setLoading(false); return null; }
      return r.json();
    }).then(d => { if (d && !d.error) setData(d); setLoading(false); }).catch(() => { setError("Failed to load"); setLoading(false); });
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Loading admin panel...</p></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (!data) return null;

  const { stats: s, orgs, recentUsers } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/dark.svg" alt="" className="h-8 w-8 rounded-xl" />
              <h1 className="text-2xl font-bold text-gray-900">Incubest Admin</h1>
              <Badge variant="destructive">Super Admin</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">Platform-wide overview</p>
          </div>
          <Link href="/incubator/dashboard">
            <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Go to Dashboard
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Organizations", value: s.totalOrgs, icon: Building2, color: "bg-violet-50 text-violet-600" },
            { label: "Total Users", value: s.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Startups", value: s.totalStartups, icon: Target, color: "bg-emerald-50 text-emerald-600" },
            { label: "Programs", value: s.totalPrograms, icon: FolderKanban, color: "bg-orange-50 text-orange-600" },
            { label: "Reports", value: s.totalReports, icon: FileText, color: "bg-pink-50 text-pink-600" },
            { label: "Mentors", value: s.totalMentors, icon: GraduationCap, color: "bg-teal-50 text-teal-600" },
            { label: "Forms", value: s.totalForms, icon: BarChart3, color: "bg-indigo-50 text-indigo-600" },
            { label: "Services", value: s.totalServices, icon: ShoppingBag, color: "bg-amber-50 text-amber-600" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Organizations */}
          <Card>
            <CardHeader><CardTitle>Organizations ({orgs.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orgs.map(org => (
                  <div key={org.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-500">
                        {[org.city, org.state].filter(Boolean).join(", ")} {org.type && `· ${org.type}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {org._count.programs} programs · {org._count.cohorts} cohorts · {org._count.admins} admin(s)
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400">{new Date(org.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === "INCUBATOR_ADMIN" ? "default" : u.role === "STARTUP_FOUNDER" ? "success" : "secondary"}>
                        {u.role.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-gray-400">{new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
