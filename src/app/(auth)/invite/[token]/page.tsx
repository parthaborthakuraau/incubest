"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

const sectors = [
  "AGRITECH", "EDTECH", "FINTECH", "HEALTHTECH", "FOODTECH",
  "CLEANTECH", "DEEPTECH", "SAAS", "ECOMMERCE", "LOGISTICS",
  "SOCIAL_IMPACT", "MANUFACTURING", "AI_ML", "IOT", "BIOTECH", "OTHER",
];

const stages = [
  "IDEATION", "VALIDATION", "EARLY_TRACTION", "SCALING", "GROWTH",
];

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      token: params.token,
      founderName: formData.get("founderName"),
      founderEmail: formData.get("founderEmail"),
      password: formData.get("password"),
      startupName: formData.get("startupName"),
      description: formData.get("description"),
      sector: formData.get("sector"),
      stage: formData.get("stage"),
      city: formData.get("city"),
      state: formData.get("state"),
      website: formData.get("website"),
      dpiitNumber: formData.get("dpiitNumber"),
      cinNumber: formData.get("cinNumber"),
      panNumber: formData.get("panNumber"),
    };

    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to join");
        setLoading(false);
        return;
      }

      router.push("/login?joined=true");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Incubest</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Join your incubator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You&apos;ve been invited to join an incubator on Incubest
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className={step === 1 ? "" : "hidden"}>
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              <p className="text-sm font-medium text-gray-700">
                Step 1: Your Details
              </p>
              <Input label="Full Name" name="founderName" required />
              <Input label="Email" name="founderEmail" type="email" required />
              <Input
                label="Password"
                name="password"
                type="password"
                minLength={8}
                required
              />
              <Button type="button" onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          </div>

          {step === 2 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              <p className="text-sm font-medium text-gray-700">
                Step 2: Startup Details
              </p>
              <Input label="Startup Name" name="startupName" required />
              <Input label="One-liner Description" name="description" />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Sector
                </label>
                <select
                  name="sector"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Stage
                </label>
                <select
                  name="stage"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" name="city" />
                <Input label="State" name="state" />
              </div>
              <Input label="Website" name="website" type="url" />

              <p className="text-xs font-medium text-gray-500 pt-2">
                Registration Details (optional — helps detect cross-incubator overlap)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Input label="DPIIT No." name="dpiitNumber" placeholder="DIPP12345" />
                <Input label="CIN" name="cinNumber" placeholder="U72XXX..." />
                <Input label="PAN" name="panNumber" placeholder="AAAAA1234A" />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Joining..." : "Join Incubator"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
