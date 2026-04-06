"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Building2, FileText, Users, FolderKanban } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SearchResult {
  type: "page" | "startup" | "program" | "cohort";
  title: string;
  description: string;
  href: string;
  icon: typeof Building2;
}

// All navigable pages for search
const INCUBATOR_PAGES: SearchResult[] = [
  { type: "page", title: "Master Dashboard", description: "Overview across all programs", href: "/incubator/dashboard", icon: Building2 },
  { type: "page", title: "Programs", description: "Manage incubation programs", href: "/incubator/programs", icon: FolderKanban },
  { type: "page", title: "All Cohorts", description: "View all cohorts", href: "/incubator/cohorts", icon: Users },
  { type: "page", title: "Passport Search", description: "Verify startups across incubators", href: "/incubator/passport-search", icon: Building2 },
  { type: "page", title: "Mentors", description: "Manage mentor pool", href: "/incubator/mentors", icon: Users },
  { type: "page", title: "Events", description: "Manage events and workshops", href: "/incubator/events", icon: FileText },
  { type: "page", title: "Services", description: "List facilities for marketplace", href: "/incubator/services", icon: Building2 },
  { type: "page", title: "Infrastructure", description: "Manage spaces and equipment", href: "/incubator/infrastructure", icon: Building2 },
  { type: "page", title: "Alumni", description: "Track graduated startups", href: "/incubator/alumni", icon: Users },
  { type: "page", title: "Grantor Reports", description: "Generate reports for grantors", href: "/incubator/grantor-reports", icon: FileText },
  { type: "page", title: "Reports", description: "Review startup reports", href: "/incubator/reports", icon: FileText },
  { type: "page", title: "Data Requests", description: "Send ad-hoc data requests", href: "/incubator/data-requests", icon: FileText },
  { type: "page", title: "Settings", description: "Account and org settings", href: "/settings", icon: Building2 },
  { type: "page", title: "AI Chat", description: "Ask AI about your portfolio", href: "/chat", icon: FileText },
];

const STARTUP_PAGES: SearchResult[] = [
  { type: "page", title: "Dashboard", description: "Your startup dashboard", href: "/startup", icon: Building2 },
  { type: "page", title: "My Incubators", description: "View and switch incubators", href: "/startup/incubators", icon: Building2 },
  { type: "page", title: "Reporting", description: "Reports, data requests, milestones", href: "/startup/reporting", icon: FileText },
  { type: "page", title: "My Passport", description: "View your startup passport", href: "/startup/passport", icon: Building2 },
  { type: "page", title: "Marketplace", description: "Browse incubator services", href: "/startup/marketplace", icon: Building2 },
  { type: "page", title: "My Startup", description: "Docs, funding, IP, jobs, impact, awards", href: "/startup/my-startup", icon: Building2 },
  { type: "page", title: "AI Advisor", description: "Get AI-powered advice", href: "/chat", icon: FileText },
  { type: "page", title: "Settings", description: "Account settings", href: "/settings", icon: Building2 },
];

export function TopbarSearch({ role }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const pages = role === "incubator" ? INCUBATOR_PAGES : STARTUP_PAGES;

  const results = query.length > 0
    ? pages.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on navigate
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={ref} className="relative hidden md:block">
      {/* Search trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white/50 px-4 py-2 text-sm text-gray-400 hover:bg-white/80 transition-colors backdrop-blur-sm"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-6 rounded-md border bg-white px-1.5 py-0.5 text-[10px] text-gray-400">⌘K</kbd>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-96 rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, features..."
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {query.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                Type to search pages and features
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No results for &quot;{query}&quot;
              </div>
            ) : (
              results.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <r.icon className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.description}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
