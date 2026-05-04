"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FolderKanban, ChevronDown, Plus } from "lucide-react";

interface ProgramInfo {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export function ProgramSwitcher({ role }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (role !== "incubator") return;
    fetch("/api/programs")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setPrograms(d);
      })
      .catch(() => {});
  }, [role, pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (role !== "incubator" || programs.length === 0) return null;

  const programMatch = pathname.match(/^\/incubator\/programs\/([^/]+)/);
  const activeProgramId = programMatch?.[1];
  const activeProgram = programs.find((p) => p.id === activeProgramId);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-all hover:bg-black/5"
        style={{ color: "#0A0A0A" }}
      >
        <FolderKanban className="h-4 w-4" style={{ color: "#8A8A82" }} />
        <span className="hidden sm:inline">{activeProgram?.name || "Programs"}</span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            backgroundColor: "#0A0A0A10",
            color: "#8A8A82",
          }}
        >
          {programs.length}
        </span>
        <ChevronDown className="h-3.5 w-3.5" style={{ color: "#8A8A82" }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-72 rounded-2xl shadow-xl z-50 overflow-hidden"
          style={{
            backgroundColor: "#FBFAF6",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 16px 48px -12px rgba(0,0,0,0.15)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
            >
              My Programs
            </p>
            <Link
              href="/incubator/programs"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: "#5a7a00" }}
            >
              <Plus className="h-3 w-3" /> New
            </Link>
          </div>

          {/* Program list */}
          <div className="py-1.5 max-h-64 overflow-y-auto">
            {programs.map((p) => {
              const isActive = p.id === activeProgramId;
              return (
                <Link
                  key={p.id}
                  href={`/incubator/programs/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition-all"
                  style={{
                    backgroundColor: isActive ? "#0A0A0A" : "transparent",
                    color: isActive ? "#fff" : "#0A0A0A",
                  }}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold shrink-0"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      backgroundColor: isActive ? "#D4FF3A" : "#0A0A0A10",
                      color: isActive ? "#0A0A0A" : "#5a5a55",
                    }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{p.name}</p>
                    <p
                      className="text-[10px] truncate"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isActive ? "#ffffff80" : "#8A8A82",
                      }}
                    >
                      {p.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  {p.isActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: isActive ? "#D4FF3A" : "#10B981" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <Link
              href="/incubator/programs"
              onClick={() => setOpen(false)}
              className="text-[12px] font-medium transition-colors hover:opacity-70"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
            >
              Manage all programs →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
