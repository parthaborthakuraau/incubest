"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Building2,
  Plus,
  X,
  MapPin,
  Users,
  Trash2,
} from "lucide-react";

interface Allocation {
  id: string;
  startDate: string;
  notes: string | null;
  startup: { id: string; name: string };
}

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number | null;
  location: string | null;
  description: string | null;
  allocations: Allocation[];
}

interface StartupOption {
  id: string;
  name: string;
}

const spaceTypes = [
  { value: "CO_WORKING", label: "Co-working" },
  { value: "PRIVATE_OFFICE", label: "Private Office" },
  { value: "LAB", label: "Lab" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "WORKSHOP_AREA", label: "Workshop Area" },
];

function typeLabel(type: string) {
  return spaceTypes.find((t) => t.value === type)?.label ?? type;
}

export default function InfrastructurePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [startups, setStartups] = useState<StartupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allocatingSpaceId, setAllocatingSpaceId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [spacesRes, startupsRes] = await Promise.all([
      fetch("/api/infrastructure"),
      fetch("/api/startups"),
    ]);
    if (spacesRes.ok) setSpaces(await spacesRes.json());
    if (startupsRes.ok) {
      const data = await startupsRes.json();
      setStartups(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function handleAddSpace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      type: formData.get("type"),
      capacity: formData.get("capacity"),
      location: formData.get("location"),
      description: formData.get("description"),
    };

    const res = await fetch("/api/infrastructure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      fetchData();
    }
    setSubmitting(false);
  }

  async function handleAllocate(e: React.FormEvent<HTMLFormElement>, spaceId: string) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      spaceId,
      startupId: formData.get("startupId"),
      startDate: formData.get("startDate"),
      notes: formData.get("notes"),
    };

    const res = await fetch("/api/infrastructure/allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setAllocatingSpaceId(null);
      fetchData();
    }
    setSubmitting(false);
  }

  async function handleDeallocate(allocationId: string) {
    const res = await fetch(`/api/infrastructure/allocations?id=${allocationId}`, {
      method: "DELETE",
    });

    if (res.ok) fetchData();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading infrastructure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure</h1>
          <p className="text-sm text-gray-500">
            Manage co-working spaces, labs, and equipment
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> Add Space</>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Space</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSpace} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Space Name" name="name" placeholder="Main Co-working Hall" required />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select type</option>
                    {spaceTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Capacity" name="capacity" type="number" placeholder="20" />
                <Input label="Location" name="location" placeholder="Building A, Floor 2" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Details about the space, amenities, etc."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Space"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {spaces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No spaces yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add co-working spaces, labs, and equipment to start managing your infrastructure.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{space.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {typeLabel(space.type)}
                    </Badge>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                    <Building2 className="h-5 w-5 text-brand-600" />
                  </div>
                </div>

                {space.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {space.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  {space.capacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Capacity: {space.capacity}
                    </span>
                  )}
                  {space.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {space.location}
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  {space.allocations.length} active allocation{space.allocations.length !== 1 ? "s" : ""}
                </div>

                {space.allocations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {space.allocations.map((alloc) => (
                      <div
                        key={alloc.id}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {alloc.startup.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Since {new Date(alloc.startDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeallocate(alloc.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove allocation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {allocatingSpaceId === space.id ? (
                  <form
                    onSubmit={(e) => handleAllocate(e, space.id)}
                    className="mt-3 space-y-2 rounded-md border border-gray-200 p-3"
                  >
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Startup</label>
                      <select
                        name="startupId"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select startup</option>
                        {startups.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <Input label="Start Date" name="startDate" type="date" required />
                    <Input label="Notes" name="notes" placeholder="Optional notes" />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? "Allocating..." : "Allocate"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAllocatingSpaceId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => setAllocatingSpaceId(space.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Allocate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
