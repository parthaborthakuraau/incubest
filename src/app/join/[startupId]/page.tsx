"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Building2, Users } from "lucide-react";

interface StartupInfo {
  id: string;
  name: string;
  sector: string;
  cohort: string;
  organization: string;
  founderEmail: string;
  founderName: string;
  hasAccount: boolean; // true if a user with this email already has a password
}

export default function JoinPage() {
  const { startupId } = useParams<{ startupId: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<StartupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  useEffect(() => {
    fetch(`/api/join/${startupId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setInfo(data);
          if (data.hasAccount) setMode("login");
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [startupId]);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/join/${startupId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "signup",
        name: fd.get("name"),
        password: fd.get("password"),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/login?joined=true");
    } else {
      setError(data.error || "Failed to join");
    }
    setSubmitting(false);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/join/${startupId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/login?joined=true");
    } else {
      setError(data.error || "Failed to connect");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error}</p>
            <Link href="/login" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Incubest</span>
          </Link>
        </div>

        {/* Startup info card */}
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900">Join {info?.organization}</h2>
            <p className="mt-1 text-sm text-gray-500">
              You&apos;ve been invited to join as a startup founder
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{info?.name}</span>
              </div>
              <Badge variant="secondary">{info?.sector?.replace(/_/g, " ")}</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-400">Cohort: {info?.cohort}</p>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Mode toggle */}
        {info?.hasAccount && (
          <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-white shadow-sm" : "text-gray-600"}`}
            >
              I have an account
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-white shadow-sm" : "text-gray-600"}`}
            >
              New here
            </button>
          </div>
        )}

        {/* Signup form */}
        {mode === "signup" && (
          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div className="rounded-lg border bg-white p-4 space-y-4">
              <p className="text-sm font-medium text-gray-700">Create your account</p>
              <Input label="Full Name" name="name" defaultValue={info?.founderName || ""} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={info?.founderEmail || ""}
                  disabled
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400">Email set by your incubator</p>
              </div>
              <Input label="Set Password" name="password" type="password" minLength={8} required />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Creating account..." : "Create Account & Join"}
              </Button>
            </div>
          </form>
        )}

        {/* Login form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="rounded-lg border bg-white p-4 space-y-4">
              <p className="text-sm font-medium text-gray-700">
                Connect your existing account to this incubator
              </p>
              <Input label="Email" name="email" type="email" defaultValue={info?.founderEmail || ""} required />
              <Input label="Password" name="password" type="password" required />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Connecting..." : "Login & Connect"}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          By joining, you agree to Incubest&apos;s terms of service.
        </p>
      </div>
    </div>
  );
}
