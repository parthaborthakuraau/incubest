"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Zap } from "lucide-react";
import Link from "next/link";

interface InviteInfo {
  orgName: string;
  role: string;
  programName: string | null;
  email: string | null;
}

export default function TeamJoinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/team/join/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setInfo(d); setLoading(false); })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/team/join/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]"><p className="text-gray-500">Loading...</p></div>;

  if (error && !info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error}</p>
            <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Go to Login</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/dark.svg" alt="Incubest" className="h-10 w-10 rounded-xl" />
            <span className="text-2xl font-bold">Incubest</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Join {info?.orgName}</h1>
          <p className="mt-2 text-sm text-gray-600">You&apos;ve been invited to join the incubator team</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="secondary">
              <Users className="mr-1 h-3 w-3" />
              {info?.role === "ADMIN" ? "Admin" : "Team Member"}
            </Badge>
            {info?.programName && <Badge variant="outline">{info.programName}</Badge>}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm font-medium text-gray-700">Create your account</p>
              <Input label="Full Name" name="name" required />
              <Input label="Email" name="email" type="email" defaultValue={info?.email || ""} required />
              <Input label="Password" name="password" type="password" minLength={8} required />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Joining..." : "Join Team"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
