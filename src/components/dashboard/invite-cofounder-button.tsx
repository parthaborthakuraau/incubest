"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Copy, Check } from "lucide-react";

export function InviteCofounderButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; joinUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleInvite() {
    if (!email) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/startup/invite-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
      setEmail("");
    } else {
      setError(data.error || "Failed to invite");
    }
    setSubmitting(false);
  }

  function close() { setOpen(false); setResult(null); setEmail(""); setError(""); setCopied(false); }

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setOpen(!open)} className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
        <UserPlus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Invite</span>
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Invite Co-founder</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Invite team members to manage your startup (max 5 total).</p>

            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

            {result ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs font-medium text-emerald-700">{result.message}</p>
                  {result.joinUrl && <code className="block text-xs text-emerald-800 break-all mt-1">{result.joinUrl}</code>}
                </div>
                {result.joinUrl && (
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => { navigator.clipboard.writeText(result.joinUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <><Check className="mr-1 h-3 w-3" /> Copied!</> : <><Copy className="mr-1 h-3 w-3" /> Copy Link</>}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setResult(null)} className="w-full">Invite Another</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cofounder@email.com" type="email" />
                <Button onClick={handleInvite} disabled={submitting || !email} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  {submitting ? "Inviting..." : "Send Invite"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
