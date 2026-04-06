"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkIcon, Copy, Check } from "lucide-react";

export function InviteButton({ cohortId }: { cohortId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generateInvite(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);

    const formData = e ? new FormData(e.currentTarget) : null;
    const email = formData?.get("email") as string;

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohortId, email: email || undefined }),
    });

    if (res.ok) {
      const data = await res.json();
      setInviteUrl(data.inviteUrl);
    }
    setLoading(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (inviteUrl) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={inviteUrl}
          readOnly
          className="max-w-xs text-xs"
        />
        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setInviteUrl(""); setShowForm(false); }}>
          Done
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={generateInvite} className="flex items-end gap-2">
        <Input
          name="email"
          type="email"
          placeholder="startup@email.com (optional)"
          className="max-w-xs"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Link"}
        </Button>
        <Button variant="ghost" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <Button onClick={() => setShowForm(true)}>
      <LinkIcon className="mr-2 h-4 w-4" />
      Invite Startup
    </Button>
  );
}
