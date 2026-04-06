"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  X,
  Users,
  FileText,
  Send,
} from "lucide-react";

interface Program {
  id: string;
  name: string;
  type: string;
  grantor: string | null;
  description: string | null;
  reportingCycle: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    cohorts: number;
    reportTemplates: number;
    dataRequests: number;
  };
  cohorts: {
    id: string;
    name: string;
    isActive: boolean;
    _count: { startups: number };
  }[];
}

const PROGRAM_TYPES = [
  { value: "AIM", label: "AIM (Atal Incubation)" },
  { value: "RKVY", label: "RKVY-RAFTAAR" },
  { value: "DST", label: "DST (Dept. of Science)" },
  { value: "DPIIT", label: "DPIIT" },
  { value: "BIRAC", label: "BIRAC" },
  { value: "TIDE", label: "TIDE 2.0" },
  { value: "HDFC_PARIVARTAN", label: "HDFC Parivartan" },
  { value: "STATE_GOVT", label: "State Government" },
  { value: "CORPORATE", label: "Corporate Program" },
  { value: "CUSTOM", label: "Custom / Other" },
];

const REPORTING_CYCLES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    const res = await fetch("/api/programs");
    if (res.ok) {
      setPrograms(await res.json());
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      type: formData.get("type"),
      grantor: formData.get("grantor"),
      description: formData.get("description"),
      reportingCycle: formData.get("reportingCycle"),
    };

    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      fetchPrograms();
    }
    setSubmitting(false);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/programs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchPrograms();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-sm text-gray-500">
            Manage incubation programs (AIM, RKVY, DST, custom grants)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> New Program</>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Program</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Program Name"
                  name="name"
                  placeholder="e.g. AIM Incubation Batch 3"
                  required
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Program Type
                  </label>
                  <select
                    name="type"
                    required
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {PROGRAM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Grantor / Funding Body"
                  name="grantor"
                  placeholder="e.g. Atal Innovation Mission, HDFC"
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Cycle
                  </label>
                  <select
                    name="reportingCycle"
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {REPORTING_CYCLES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Description"
                name="description"
                placeholder="Brief description of this program"
              />

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Program"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {programs.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No programs yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create programs to organize your cohorts by grant or initiative
              (AIM, RKVY, DST, etc.)
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const totalStartups = program.cohorts.reduce(
              (sum, c) => sum + c._count.startups,
              0
            );

            return (
              <Link key={program.id} href={`/incubator/programs/${program.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.04)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{program.name}</h3>
                      {program.description && (
                        <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={program.isActive ? "success" : "secondary"}>
                      {program.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {PROGRAM_TYPES.find((t) => t.value === program.type)?.label || program.type}
                    </Badge>
                    {program.grantor && (
                      <Badge variant="secondary">{program.grantor}</Badge>
                    )}
                    <Badge variant="outline">{program.reportingCycle}</Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {totalStartups} startups
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {program._count.cohorts} cohorts
                    </span>
                    <span className="flex items-center gap-1">
                      <Send className="h-3.5 w-3.5" />
                      {program._count.dataRequests} requests
                    </span>
                  </div>

                  {/* Cohorts list */}
                  {program.cohorts.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {program.cohorts.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs"
                        >
                          <span>{c.name}</span>
                          <span className="text-gray-400">
                            {c._count.startups} startups
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleActive(program.id, program.isActive); }}
                      className="text-xs"
                    >
                      {program.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
