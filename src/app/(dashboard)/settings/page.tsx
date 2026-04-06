"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { User, Building2, Lock, Save, CheckCircle2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface OrgData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  type: string | null;
  logo: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "password">("profile");

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Org form
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgState, setOrgState] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setOrg(data.organization);

        if (data.user) {
          setProfileName(data.user.name);
          setProfilePhone(data.user.phone || "");
        }
        if (data.organization) {
          setOrgName(data.organization.name);
          setOrgDescription(data.organization.description || "");
          setOrgWebsite(data.organization.website || "");
          setOrgCity(data.organization.city || "");
          setOrgState(data.organization.state || "");
          setOrgType(data.organization.type || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setProfileSaving(true);
    setProfileSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "profile",
        name: profileName,
        phone: profilePhone,
      }),
    });
    if (res.ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setProfileSaving(false);
  }

  async function saveOrg() {
    setOrgSaving(true);
    setOrgSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "organization",
        name: orgName,
        description: orgDescription,
        website: orgWebsite,
        city: orgCity,
        state: orgState,
        type: orgType,
      }),
    });
    if (res.ok) {
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 3000);
    }
    setOrgSaving(false);
  }

  async function changePassword() {
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "password",
        currentPassword,
        newPassword,
      }),
    });

    if (res.ok) {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } else {
      const data = await res.json();
      setPasswordError(data.error || "Failed to change password");
    }
    setPasswordSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  const isAdmin = user?.role === "INCUBATOR_ADMIN";

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account and {isAdmin ? "organization " : ""}preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("organization")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "organization"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Organization
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("team" as "profile")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              (activeTab as string) === "team"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="h-4 w-4" />
            Team
          </button>
        )}
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "password"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Lock className="h-4 w-4" />
          Password
        </button>
      </div>

      {/* ─── Profile Tab ──────────────────────────────── */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="flex items-center gap-2">
                <Input value={user?.email || ""} disabled />
                <Badge variant="secondary">
                  {user?.role?.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
            <Input
              label="Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <Input
              label="Phone"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
            <div className="flex items-center gap-3 border-t pt-4">
              <Button onClick={saveProfile} disabled={profileSaving}>
                <Save className="mr-2 h-4 w-4" />
                {profileSaving ? "Saving..." : "Save Profile"}
              </Button>
              {profileSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Organization Tab ─────────────────────────── */}
      {activeTab === "organization" && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />

            {/* Logo upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Logo</label>
              {org?.logo && (
                <img src={org.logo} alt="Logo" className="mb-2 h-16 w-16 rounded-lg object-cover border" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  if (res.ok) {
                    const { url } = await res.json();
                    // Save immediately
                    await fetch("/api/settings", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ section: "organization", logo: url }),
                    });
                    fetchSettings();
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Brief description of your incubator"
              />
            </div>
            <Input
              label="Website"
              value={orgWebsite}
              onChange={(e) => setOrgWebsite(e.target.value)}
              placeholder="https://your-incubator.org"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="City"
                value={orgCity}
                onChange={(e) => setOrgCity(e.target.value)}
              />
              <Input
                label="State"
                value={orgState}
                onChange={(e) => setOrgState(e.target.value)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select type</option>
                  <option value="TBI">TBI</option>
                  <option value="AIC">AIC (Atal Incubation Centre)</option>
                  <option value="State Incubator">State Incubator</option>
                  <option value="Private">Private</option>
                  <option value="University">University</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t pt-4">
              <Button onClick={saveOrg} disabled={orgSaving}>
                <Save className="mr-2 h-4 w-4" />
                {orgSaving ? "Saving..." : "Save Organization"}
              </Button>
              {orgSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Password Tab ─────────────────────────────── */}
      {activeTab === "password" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            <div className="flex items-center gap-3 border-t pt-4">
              <Button
                onClick={changePassword}
                disabled={
                  passwordSaving ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                <Lock className="mr-2 h-4 w-4" />
                {passwordSaving ? "Changing..." : "Change Password"}
              </Button>
              {passwordSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Password changed
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Team Tab ─────────────────────────────── */}
      {(activeTab as string) === "team" && isAdmin && <TeamSection />}

      {/* Logout */}
      <Card className="border-red-100">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-medium text-gray-900">Sign Out</p>
            <p className="text-xs text-gray-500">Log out of your Incubest account</p>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Team Section ───────────────────────────────────

function TeamSection() {
  const [members, setMembers] = useState<{ id: string; name: string; email: string; photo: string | null; teamRole: string | null; assignedProgramId: string | null; createdAt: string }[]>([]);
  const [invites, setInvites] = useState<{ id: string; email: string | null; role: string; programId: string | null; status: string; createdAt: string }[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    fetch("/api/team").then(r => r.json()).then(d => {
      setMembers(d.members || []);
      setInvites(d.invites || []);
      setLoadingTeam(false);
    }).catch(() => setLoadingTeam(false));
  }, []);

  async function cancelInvite(id: string) {
    await fetch(`/api/team?id=${id}`, { method: "DELETE" });
    setInvites(invites.filter(i => i.id !== id));
  }

  if (loadingTeam) return <p className="text-sm text-gray-500">Loading team...</p>;

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  {m.photo ? (
                    <img src={m.photo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    (!m.teamRole || m.teamRole === "ADMIN") ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {(!m.teamRole || m.teamRole === "ADMIN") ? "Admin" : "Member"}
                  </span>
                  {i === 0 && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Owner</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.filter(i => i.status === "PENDING").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invites.filter(i => i.status === "PENDING").map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 p-3">
                  <div>
                    <p className="text-sm text-gray-700">{inv.email || "No email specified"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium ${inv.role === "ADMIN" ? "text-violet-600" : "text-blue-600"}`}>
                        {inv.role === "ADMIN" ? "Admin" : "Member"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => cancelInvite(inv.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
