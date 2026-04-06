"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, X, ChevronDown, ChevronRight } from "lucide-react";

interface DocItem {
  title: string;
  description: string;
  steps: string[];
  category: string;
}

const INCUBATOR_DOCS: DocItem[] = [
  { category: "Getting Started", title: "Create your first program", description: "Set up AIM, RKVY, or custom programs with verticals and cohorts",
    steps: ["Go to Programs in the sidebar", "Click '+ New Program'", "Select program type (AIM, RKVY, DST, Custom)", "Set grantor name and reporting cycle", "Click Create — default report templates are auto-generated for known types"] },
  { category: "Getting Started", title: "Add startups to a cohort", description: "Add individually or bulk upload via CSV, then invite",
    steps: ["Open a Program → Cohorts tab", "Click into a cohort (or create one first)", "Use '+ Add Startup' for single entry (name, founder, email)", "Or 'Upload CSV' with columns: startup_name, founder_name, founder_email", "Select startups → click 'Invite' → copy the join links"] },
  { category: "Getting Started", title: "Set up report templates", description: "Customize what startups report monthly",
    steps: ["Inside a Program → click Settings (gear icon)", "Go to Report Templates section", "Templates are auto-created for known program types", "You can create custom templates from Grantor Reports page"] },
  { category: "Programs", title: "Managing verticals", description: "Create sub-programs within a program",
    steps: ["Inside a Program → click Settings", "Under Verticals section, click Add Vertical", "Name it (e.g. Student Track, Pre-Seed)", "Cohorts can then be assigned to a vertical", "Startups can also be tagged with a vertical directly"] },
  { category: "Programs", title: "Program workspace", description: "Everything about a program in one place",
    steps: ["Click any program from the sidebar or Programs page", "Overview: KPIs, diversity, sector/stage distribution", "Cohorts: create cohorts, add startups, invite", "Startups: full table with search, filters, sort", "Founders: contact directory", "Financials: fund pool, disbursements", "Reports: compliance tracking, review", "Mentors: assign from pool, track sessions", "Analytics: charts for reporting, revenue, pipeline", "Export: CSV downloads for all data"] },
  { category: "Reporting", title: "Review startup reports", description: "View, review, and provide feedback",
    steps: ["Go to Reports in sidebar (or Program → Reports tab)", "Click a report to expand and see submitted data", "Use the review textarea to add feedback", "Click 'Mark as Reviewed'", "Startup will see your feedback in their reports page"] },
  { category: "Reporting", title: "Send data requests", description: "Send ad-hoc data collection to specific startups",
    steps: ["Go to Data Requests (sidebar or inside a Program)", "Click '+ New Request'", "Add title, deadline, and custom fields", "Select which startups should respond", "Click Send — startups get notified immediately"] },
  { category: "Passport", title: "Passport search", description: "Verify startups before inducting",
    steps: ["Go to Passport Search in sidebar", "Enter any identifier: Passport ID, DPIIT, CIN, PAN, email, or name", "Results show which incubator the startup is at", "Yellow badge = different incubator (cross-incubator alert)", "Click 'Passport' to see their full public profile"] },
  { category: "Marketplace", title: "List your services", description: "Add facilities for the marketplace",
    steps: ["Go to Services in sidebar", "Click '+ Add Service'", "Add title, description, category, pricing", "Optionally upload a photo", "Startups across India can now discover and request access", "You'll get notified when a startup requests — approve/decline from the same page"] },
];

const STARTUP_DOCS: DocItem[] = [
  { category: "Getting Started", title: "Complete your passport", description: "Fill in profile to unlock your Startup Passport",
    steps: ["Go to My Passport in sidebar", "You'll see which fields are missing", "Click 'Complete Profile' to go to the guided form", "Fill Basic Info, Registration (DPIIT/PAN/CIN), Founders & Branding", "Once mandatory fields are done, your passport unlocks"] },
  { category: "Getting Started", title: "Submit monthly reports", description: "How to submit your monthly report",
    steps: ["Go to Reporting → Monthly Reports tab", "Fill in the fields for the current month", "Click Submit", "Your incubator can review and provide feedback", "Check back for the green 'Reviewed' badge and feedback notes"] },
  { category: "Reporting", title: "Respond to data requests", description: "Handle ad-hoc requests from your incubator",
    steps: ["You'll see a yellow badge in the topbar when requests are pending", "Go to Reporting → Data Requests tab", "Click 'Respond' on any pending request", "Fill in the requested fields", "Click Submit — your incubator gets notified"] },
  { category: "My Startup", title: "Upload documents", description: "Add pitch decks, certificates",
    steps: ["Go to My Startup → Documents tab", "Click '+ Add Document'", "Upload a file directly or paste a URL", "Select the document type (pitch deck, DPIIT cert, etc.)", "Your incubator can see uploaded documents"] },
  { category: "My Startup", title: "Add awards", description: "Showcase achievements",
    steps: ["Go to My Startup → Awards tab", "Click '+ Add Award'", "Enter title, description, date", "Upload a photo/certificate", "Add social media announcement link", "Your incubator can see awards on your detail page"] },
  { category: "Marketplace", title: "Browse and request services", description: "Access facilities from any incubator",
    steps: ["Go to Marketplace in sidebar", "Browse by category, state, or search", "Click 'Request Access' on any service", "Add an optional message", "You'll be notified when approved — contact details shown after approval"] },
  { category: "Passport", title: "Multiple incubators", description: "If you're part of more than one incubator",
    steps: ["Go to My Incubators in sidebar", "You'll see all incubators you're connected to", "Click 'Switch' to change your active context", "Reports, milestones etc. are submitted for the active incubator", "Your passport shows ALL incubator associations"] },
];

export function TopbarDocs({ role }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const docs = role === "incubator" ? INCUBATOR_DOCS : STARTUP_DOCS;
  const filtered = search
    ? docs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
    : docs;

  const categories = [...new Set(filtered.map((d) => d.category))];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset expanded when search changes
  useEffect(() => { setExpandedIdx(null); }, [search]);

  let globalIdx = -1;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        title="Help & Documentation"
      >
        <BookOpen className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[420px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Help & Documentation</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b px-4 py-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {categories.map((cat) => (
              <div key={cat} className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{cat}</p>
                {filtered
                  .filter((d) => d.category === cat)
                  .map((d) => {
                    globalIdx++;
                    const idx = globalIdx;
                    const isExpanded = expandedIdx === idx;
                    return (
                      <div key={idx}>
                        <button
                          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{d.title}</p>
                            <p className="text-xs text-gray-500">{d.description}</p>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="ml-6 mr-3 mb-2 rounded-lg bg-gray-50 p-3">
                            <ol className="space-y-1.5">
                              {d.steps.map((step, si) => (
                                <li key={si} className="flex gap-2 text-xs text-gray-700">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                                    {si + 1}
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-gray-400">No docs matching &quot;{search}&quot;</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
