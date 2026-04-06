"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Plus, Users, X } from "lucide-react";
import Link from "next/link";

interface ProgramOption {
  id: string;
  name: string;
}

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  _count: { startups: number };
  program: { id: string; name: string } | null;
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCohorts();
  }, []);

  async function fetchCohorts() {
    const res = await fetch("/api/cohorts");
    const data = await res.json();
    setCohorts(data.cohorts);
    setPrograms(data.programs || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate") || null,
        programId: formData.get("programId") || null,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      fetchCohorts();
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading cohorts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
          <p className="text-sm text-gray-500">
            Manage your startup batches
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> New Cohort
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Cohort</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Cohort Name" name="name" placeholder="e.g. Cohort 12 - 2026" required />
              <Input label="Description" name="description" placeholder="Optional description" />
              {programs.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Program (optional)
                  </label>
                  <select
                    name="programId"
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">No program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" name="startDate" type="date" required />
                <Input label="End Date" name="endDate" type="date" />
              </div>
              <Button type="submit">Create Cohort</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {cohorts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No cohorts yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first cohort to start onboarding startups.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => (
            <Link key={cohort.id} href={`/incubator/cohorts/${cohort.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{cohort.name}</h3>
                    <Badge variant={cohort.isActive ? "success" : "secondary"}>
                      {cohort.isActive ? "Active" : "Completed"}
                    </Badge>
                  </div>
                  {cohort.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {cohort.description}
                    </p>
                  )}
                  {cohort.program && (
                    <div className="mt-2">
                      <Badge variant="outline">{cohort.program.name}</Badge>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {cohort._count.startups} startups
                    </span>
                    <span>
                      Started{" "}
                      {new Date(cohort.startDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
