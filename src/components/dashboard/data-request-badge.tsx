"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import Link from "next/link";

export function DataRequestBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          const pending = data.tasks.filter((t: { type: string }) => t.type === "data_request").length;
          setCount(pending);
        }
      })
      .catch(() => {});
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/startup/reporting"
      className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    >
      <Send className="h-5 w-5" />
      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white">
        {count > 9 ? "9+" : count}
      </span>
    </Link>
  );
}
