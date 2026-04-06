"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function SendRemindersButton() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setResult(null);

    const res = await fetch("/api/notifications/send-reminders", {
      method: "POST",
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data.message);
    } else {
      setResult("Failed to send reminders");
    }
    setSending(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleSend} disabled={sending}>
        <Bell className="mr-1.5 h-3.5 w-3.5" />
        {sending ? "Sending..." : "Send Reminders"}
      </Button>
      {result && (
        <span className="text-xs text-gray-500">{result}</span>
      )}
    </div>
  );
}
