"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, X } from "lucide-react";
import Link from "next/link";

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  _count: { startups: number };
}

export default function ProgramCohortsPage() {
  const { id: programId } = useParams<{ id: string }>();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCohorts();
  }, [programId]);

  async function fetchCohorts() {
    const res = await fetch(`/api/cohorts?programId=${programId}`);
    const data = await res.json();
    setCohorts(data.cohorts || []);
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
        programId,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
          <p className="text-sm text-gray-500">Cohorts in this program</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Cohort</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create New Cohort</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Cohort Name" name="name" placeholder="e.g. Batch 3 - 2026" required />
              <Input label="Description" name="description" placeholder="Optional description" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" name="startDate" type="date" required />
                <Input label="End Date" name="endDate" type="date" />
              </div>
              <Button type="submit">Create Cohort</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {cohorts.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No cohorts yet</h3>
            <p className="mt-2 text-sm text-gray-500">Create your first cohort for this program.</p>
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
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{cohort.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {cohort._count.startups} startups
                    </span>
                    <span>
                      Started {new Date(cohort.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
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
