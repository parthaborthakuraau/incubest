"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  GraduationCap,
  Plus,
  X,
  User,
  Linkedin,
  Calendar,
} from "lucide-react";

interface Mentor {
  id: string;
  expertise: string[];
  bio: string | null;
  photo: string | null;
  linkedIn: string | null;
  user: { name: string; email: string };
  _count: { sessions: number };
}

interface MentorSession {
  id: string;
  date: string;
  duration: number;
  notes: string | null;
  actionItems: string | null;
  mentor: { user: { name: string } };
  startup: { name: string };
}

interface Startup {
  id: string;
  name: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"mentors" | "sessions">("mentors");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [mentorsRes, sessionsRes, startupsRes] = await Promise.all([
      fetch("/api/mentors"),
      fetch("/api/mentors/sessions"),
      fetch("/api/startups"),
    ]);
    if (mentorsRes.ok) setMentors(await mentorsRes.json());
    if (sessionsRes.ok) setSessions(await sessionsRes.json());
    if (startupsRes.ok) setStartups(await startupsRes.json());
    setLoading(false);
  }

  async function handleAddMentor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Upload photo if provided
    let photoUrl: string | null = null;
    const fileInput = e.currentTarget.querySelector('input[name="photo"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const fd = new FormData();
      fd.append("file", fileInput.files[0]);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (upRes.ok) photoUrl = (await upRes.json()).url;
    }

    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      expertise: (formData.get("expertise") as string).split(",").map((s) => s.trim()).filter(Boolean),
      bio: formData.get("bio") || "",
      linkedIn: formData.get("linkedIn") || "",
      photo: photoUrl,
    };

    const res = await fetch("/api/mentors", {
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

  async function handleLogSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      mentorId: formData.get("mentorId"),
      startupId: formData.get("startupId"),
      date: formData.get("date"),
      duration: formData.get("duration"),
      notes: formData.get("notes") || "",
      actionItems: formData.get("actionItems") || "",
    };

    const res = await fetch("/api/mentors/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowSessionForm(false);
      setActiveTab("sessions");
      fetchData();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading mentors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentors</h1>
          <p className="text-sm text-gray-500">
            Manage mentors and track sessions
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> Add Mentor</>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Mentor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full Name" name="name" placeholder="Dr. Arun Sharma" required />
                <Input label="Email" name="email" type="email" placeholder="mentor@email.com" required />
              </div>
              <Input
                label="Areas of Expertise"
                name="expertise"
                placeholder="Product Strategy, Fundraising, Marketing (comma-separated)"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Brief background and experience"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <Input label="LinkedIn URL" name="linkedIn" placeholder="https://linkedin.com/in/..." />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Photo (optional)</label>
                <input name="photo" type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700" />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Mentor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("mentors")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "mentors"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mentors ({mentors.length})
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "sessions"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sessions ({sessions.length})
        </button>
      </div>

      {activeTab === "mentors" && (
        <>
          {mentors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No mentors yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add mentors to your incubator to start tracking sessions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {mentor.photo ? (
                        <img src={mentor.photo} alt={mentor.user.name} className="h-14 w-14 rounded-2xl object-cover border border-gray-200/80 shadow-sm" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100">
                          <User className="h-6 w-6 text-violet-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{mentor.user.name}</h3>
                        <p className="text-xs text-gray-500">{mentor.user.email}</p>
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {mentor.bio}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1">
                      {mentor.expertise.map((exp, i) => (
                        <Badge key={i} variant="secondary">
                          {exp}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {mentor._count.sessions} sessions
                      </span>
                      {mentor.linkedIn && (
                        <a
                          href={mentor.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-600 hover:underline"
                        >
                          <Linkedin className="h-3 w-3" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "sessions" && (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowSessionForm(!showSessionForm)}
              size="sm"
              variant={showSessionForm ? "outline" : "default"}
            >
              {showSessionForm ? (
                <><X className="mr-2 h-4 w-4" /> Cancel</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Log Session</>
              )}
            </Button>
          </div>

          {showSessionForm && (
            <Card>
              <CardHeader>
                <CardTitle>Log Mentor Session</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogSession} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Mentor
                      </label>
                      <select
                        name="mentorId"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select mentor...</option>
                        {mentors.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Startup
                      </label>
                      <select
                        name="startupId"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select startup...</option>
                        {startups.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Date"
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                    <Input
                      label="Duration (minutes)"
                      name="duration"
                      type="number"
                      placeholder="60"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Session Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="What was discussed?"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Action Items
                    </label>
                    <textarea
                      name="actionItems"
                      rows={2}
                      placeholder="Follow-up tasks or next steps"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Log Session"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {sessions.length === 0 && !showSessionForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No sessions yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Mentor sessions will appear here once they are logged.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {session.mentor.user.name} &rarr; {session.startup.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" "}&middot; {session.duration} min
                          </p>
                        </div>
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-600">{session.notes}</p>
                      )}
                      {session.actionItems && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500">Action Items:</p>
                          <p className="text-sm text-gray-600">{session.actionItems}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
