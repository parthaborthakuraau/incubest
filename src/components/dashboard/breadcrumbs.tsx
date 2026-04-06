"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  incubator: "Incubator",
  startup: "Startup",
  dashboard: "Dashboard",
  programs: "Programs",
  cohorts: "Cohorts",
  mentors: "Mentors",
  events: "Events",
  services: "Services",
  infrastructure: "Infrastructure",
  alumni: "Alumni",
  reports: "Reports",
  settings: "Settings",
  chat: "AI Chat",
  "passport-search": "Passport Search",
  "data-requests": "Data Requests",
  "grantor-reports": "Grantor Reports",
  "impact-dashboard": "Impact",
  "my-startup": "My Startup",
  marketplace: "Marketplace",
  passport: "My Passport",
  reporting: "Reporting",
  incubators: "My Incubators",
  forms: "Forms",
  profile: "Profile",
  tasks: "Tasks",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null; // Don't show on root pages

  const crumbs: { label: string; href: string }[] = [];
  let path = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    path += `/${seg}`;

    // Skip IDs (cuid patterns)
    if (seg.length > 20 && !LABEL_MAP[seg]) {
      crumbs.push({ label: "...", href: path });
      continue;
    }

    const label = LABEL_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: path });
  }

  // Only show last 3 crumbs to keep it clean
  const visible = crumbs.slice(-3);

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400">
      {visible.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i === visible.length - 1 ? (
            <span className="text-gray-700 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-gray-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
