"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  CalendarDays,
  Plus,
  X,
  MapPin,
  Video,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  type: string;
  description: string | null;
  date: string;
  endDate: string | null;
  venue: string | null;
  isVirtual: boolean;
  maxAttendees: number | null;
  _count: { attendees: number };
}

interface Startup {
  id: string;
  name: string;
  slug: string;
}

interface Attendance {
  id: string;
  attended: boolean;
  startupId: string;
  startup: Startup;
}

const EVENT_TYPES = [
  { value: "hackathon", label: "Hackathon" },
  { value: "workshop", label: "Workshop" },
  { value: "demo_day", label: "Demo Day" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "investor_meet", label: "Investor Meet" },
  { value: "seminar", label: "Seminar" },
  { value: "session", label: "Session" },
];

const typeLabels: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label])
);

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [attendances, setAttendances] = useState<Record<string, Attendance[]>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [eventsRes, startupsRes] = await Promise.all([
      fetch("/api/events"),
      fetch("/api/startups"),
    ]);
    if (eventsRes.ok) setEvents(await eventsRes.json());
    if (startupsRes.ok) setStartups(await startupsRes.json());
    setLoading(false);
  }

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description") || "",
      date: formData.get("date"),
      endDate: formData.get("endDate") || null,
      venue: formData.get("venue") || "",
      isVirtual: formData.get("isVirtual") === "on",
      maxAttendees: formData.get("maxAttendees")
        ? Number(formData.get("maxAttendees"))
        : null,
    };

    const res = await fetch("/api/events", {
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

  async function toggleExpand(eventId: string) {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }

    setExpandedEvent(eventId);

    if (!attendances[eventId]) {
      const res = await fetch(`/api/events/attendance?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendances((prev) => ({ ...prev, [eventId]: data }));
      }
    }
  }

  async function saveAttendance(eventId: string) {
    setSavingAttendance(true);

    const eventAttendances = attendances[eventId] || [];
    // Build attendees from both existing attendance records and all startups
    const attendedMap = new Map(
      eventAttendances.map((a) => [a.startupId, a.attended])
    );

    const attendeesPayload = startups.map((s) => ({
      startupId: s.id,
      attended: attendedMap.get(s.id) || false,
    }));

    await fetch("/api/events/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, attendees: attendeesPayload }),
    });

    // Refresh attendance data
    const res = await fetch(`/api/events/attendance?eventId=${eventId}`);
    if (res.ok) {
      const data = await res.json();
      setAttendances((prev) => ({ ...prev, [eventId]: data }));
    }

    // Refresh events to update count
    const eventsRes = await fetch("/api/events");
    if (eventsRes.ok) setEvents(await eventsRes.json());

    setSavingAttendance(false);
  }

  function toggleStartupAttendance(eventId: string, startupId: string) {
    setAttendances((prev) => {
      const current = prev[eventId] || [];
      const existing = current.find((a) => a.startupId === startupId);

      if (existing) {
        return {
          ...prev,
          [eventId]: current.map((a) =>
            a.startupId === startupId ? { ...a, attended: !a.attended } : a
          ),
        };
      }

      // Add new attendance record locally
      const startup = startups.find((s) => s.id === startupId);
      return {
        ...prev,
        [eventId]: [
          ...current,
          {
            id: `temp-${startupId}`,
            attended: true,
            startupId,
            startup: startup || { id: startupId, name: "", slug: "" },
          },
        ],
      };
    });
  }

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pastEvents = events.filter((e) => new Date(e.date) < now);
  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Events &amp; Workshops
          </h1>
          <p className="text-sm text-gray-500">
            Organize events and track attendance
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Event Name"
                  name="name"
                  placeholder="Demo Day - Cohort 3"
                  required
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Event Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select type</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Event details and agenda"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Start Date" name="date" type="datetime-local" required />
                <Input label="End Date" name="endDate" type="datetime-local" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Venue" name="venue" placeholder="Main Auditorium" />
                <Input
                  label="Max Attendees"
                  name="maxAttendees"
                  type="number"
                  placeholder="50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVirtual"
                  id="isVirtual"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isVirtual" className="text-sm text-gray-700">
                  Virtual event
                </label>
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upcoming"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "past"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Past ({pastEvents.length})
        </button>
      </div>

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {activeTab} events
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeTab === "upcoming"
                ? "Create an event to get started."
                : "Past events will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedEvents.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const eventAttendances = attendances[event.id] || [];
            const attendedMap = new Map(
              eventAttendances.map((a) => [a.startupId, a.attended])
            );

            return (
              <Card key={event.id}>
                <CardContent className="p-5">
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {event.name}
                        </h3>
                        <Badge variant="secondary">
                          {typeLabels[event.type] || event.type}
                        </Badge>
                        {event.isVirtual && (
                          <Badge variant="outline">
                            <Video className="mr-1 h-3 w-3" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(event.date)}
                          {event.endDate && ` - ${formatDate(event.endDate)}`}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.venue}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event._count.attendees} attendees
                          {event.maxAttendees && ` / ${event.maxAttendees} max`}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t pt-4">
                      {event.description && (
                        <p className="mb-4 text-sm text-gray-600">
                          {event.description}
                        </p>
                      )}

                      <h4 className="mb-2 text-sm font-medium text-gray-700">
                        Mark Attendance
                      </h4>
                      {startups.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No startups found in your organization.
                        </p>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {startups.map((startup) => (
                              <label
                                key={startup.id}
                                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={attendedMap.get(startup.id) || false}
                                  onChange={() =>
                                    toggleStartupAttendance(event.id, startup.id)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                <span className="text-sm font-medium">
                                  {startup.name}
                                </span>
                              </label>
                            ))}
                          </div>
                          <Button
                            className="mt-3"
                            onClick={() => saveAttendance(event.id)}
                            disabled={savingAttendance}
                          >
                            {savingAttendance
                              ? "Saving..."
                              : "Save Attendance"}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
