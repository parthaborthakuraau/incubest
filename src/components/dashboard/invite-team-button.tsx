"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Copy, Check, Link as LinkIcon } from "lucide-react";

interface ProgramOption { id: string; name: string; }

export function InviteTeamButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [programId, setProgramId] = useState("");
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && programs.length === 0) {
      fetch("/api/programs").then(r => r.json()).then(d => {
        if (Array.isArray(d)) setPrograms(d.map((p: ProgramOption) => ({ id: p.id, name: p.name })));
      }).catch(() => {});
    }
  }, [open]);

  async function handleInvite() {
    if (role === "MEMBER" && !programId) return;
    setSubmitting(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || null, role, programId: role === "MEMBER" ? programId : null }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviteUrl(data.inviteUrl);
      setEmail("");
    }
    setSubmitting(false);
  }

  function copyLink() {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function close() {
    setOpen(false); setInviteUrl(null); setEmail(""); setCopied(false); setProgramId("");
  }

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setOpen(!open)} className="gap-1.5">
        <UserPlus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Invite Team</span>
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Invite Team Member</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>

            {inviteUrl ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Invite link generated!</p>
                  <code className="block text-xs text-green-800 break-all">{inviteUrl}</code>
                </div>
                <Button size="sm" onClick={copyLink} className="w-full">
                  {copied ? <><Check className="mr-1.5 h-3 w-3" /> Copied!</> : <><Copy className="mr-1.5 h-3 w-3" /> Copy Link</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setInviteUrl(null)} className="w-full">Invite Another</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input label="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} placeholder="teammate@email.com" type="email" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex gap-2">
                    <button onClick={() => setRole("ADMIN")}
                      className={`flex-1 rounded-xl border p-3 text-left transition-all ${role === "ADMIN" ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300"}`}>
                      <p className="text-xs font-semibold text-gray-900">Admin</p>
                      <p className="text-[10px] text-gray-500">Full access</p>
                    </button>
                    <button onClick={() => setRole("MEMBER")}
                      className={`flex-1 rounded-xl border p-3 text-left transition-all ${role === "MEMBER" ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300"}`}>
                      <p className="text-xs font-semibold text-gray-900">Member</p>
                      <p className="text-[10px] text-gray-500">Program-specific</p>
                    </button>
                  </div>
                </div>

                {/* Program selector for MEMBER role */}
                {role === "MEMBER" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Program *</label>
                    <select value={programId} onChange={e => setProgramId(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
                      <option value="">Select program</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                <Button onClick={handleInvite} disabled={submitting || (role === "MEMBER" && !programId)} className="w-full">
                  <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
                  {submitting ? "Generating..." : "Generate Invite Link"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
