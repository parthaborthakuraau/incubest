"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Users,
  UserCheck,
  UserPlus,
  Plus,
  Loader2,
  Check,
  Tag,
} from "lucide-react";

interface JobCategory {
  id: string;
  name: string;
  type: "direct" | "indirect";
  description: string | null;
}

interface JobRecord {
  id: string;
  count: number;
  month: number;
  year: number;
  description: string | null;
  category: {
    id: string;
    name: string;
    type: string;
  };
  startup: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function IncubatorJobsPage() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [records, setRecords] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "direct" as "direct" | "indirect",
    description: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs/categories").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]).then(([cats, recs]) => {
      setCategories(cats);
      setRecords(recs);
      setLoading(false);
    });
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
        setFormData({ name: "", type: "direct", description: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setSubmitting(false);
    }
  }

  // Compute aggregates
  const totalDirect = records.reduce(
    (sum, r) => (r.category.type === "direct" ? sum + r.count : sum),
    0
  );
  const totalIndirect = records.reduce(
    (sum, r) => (r.category.type === "indirect" ? sum + r.count : sum),
    0
  );
  const totalJobs = totalDirect + totalIndirect;

  // Aggregate by category
  const categoryTotals = categories.map((cat) => {
    const total = records
      .filter((r) => r.category.id === cat.id)
      .reduce((sum, r) => sum + r.count, 0);
    const startupCount = new Set(
      records.filter((r) => r.category.id === cat.id).map((r) => r.startup.id)
    ).size;
    return { ...cat, total, startupCount };
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Categories</h1>
          <p className="text-sm text-gray-500">
            Configure how startups report employment
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Direct Jobs"
          value={totalDirect}
          icon={UserCheck}
        />
        <StatCard
          title="Total Indirect Jobs"
          value={totalIndirect}
          icon={UserPlus}
        />
        <StatCard title="Total Jobs" value={totalJobs} icon={Users} />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Job Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Category Name
                  </label>
                  <Input
                    placeholder="e.g. Farmers, Artisans, Full-time"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as "direct" | "indirect",
                      }))
                    }
                  >
                    <option value="direct">Direct</option>
                    <option value="indirect">Indirect</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <Input
                  placeholder="Brief description of this job category"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Category
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No job categories yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create categories so startups can report their employment impact.
              Examples: Farmers, Artisans, Weavers, Full-time, Part-time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Categories &amp; Aggregate Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Total Jobs</th>
                    <th className="pb-3 font-medium">Startups Reporting</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTotals.map((cat) => (
                    <tr key={cat.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{cat.name}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            cat.type === "direct" ? "default" : "secondary"
                          }
                        >
                          {cat.type}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        {cat.description || "---"}
                      </td>
                      <td className="py-3 font-semibold">{cat.total}</td>
                      <td className="py-3">{cat.startupCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Startup Job Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Startup</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Count</th>
                    <th className="pb-3 font-medium">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{rec.startup.name}</td>
                      <td className="py-3">{rec.category.name}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            rec.category.type === "direct"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {rec.category.type}
                        </Badge>
                      </td>
                      <td className="py-3">{rec.count}</td>
                      <td className="py-3 text-gray-500">
                        {[
                          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                        ][rec.month - 1]}{" "}
                        {rec.year}
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
