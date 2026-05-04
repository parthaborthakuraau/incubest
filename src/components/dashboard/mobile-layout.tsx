"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { DataRequestBadge } from "./data-request-badge";
import { TopbarSearch } from "./topbar-search";
import { Breadcrumbs } from "./breadcrumbs";
import { TopbarDocs } from "./topbar-docs";
import { Sidebar } from "./sidebar";
import { InviteTeamButton } from "./invite-team-button";
import { InviteCofounderButton } from "./invite-cofounder-button";

export function MobileLayout({
  children,
  role,
  orgName,
  teamRole,
  assignedProgramId,
}: {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  role?: string;
  orgName?: string;
  teamRole?: string | null;
  assignedProgramId?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isStartup = role === "startup";

  return (
    <div className="flex h-screen" style={{ backgroundColor: isStartup ? "#FBFAF6" : "#F4F1EA", fontFamily: "'Geist', sans-serif" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar role={(role || "incubator") as "incubator" | "startup"} orgName={orgName} teamRole={teamRole} assignedProgramId={assignedProgramId} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <Sidebar role={(role || "incubator") as "incubator" | "startup"} orgName={orgName} teamRole={teamRole} assignedProgramId={assignedProgramId} />
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex h-14 items-center gap-3 px-4 md:px-6 border-b"
          style={{ backgroundColor: isStartup ? "#FBFAF6" : "#F4F1EA", borderColor: "rgba(0,0,0,0.06)" }}
        >
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-gray-500 hover:bg-black/5 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block"><Breadcrumbs /></div>
          <div className="flex-1"><TopbarSearch role={role} /></div>
          <div className="flex items-center gap-1.5">
            {role === "incubator" && <InviteTeamButton />}
            {role === "startup" && <InviteCofounderButton />}
            <TopbarDocs role={role} />
            {role === "startup" && <DataRequestBadge />}
            <NotificationBell />
          </div>
        </header>

        {/* Content - floating white card */}
        <div className="flex-1 overflow-hidden px-0 md:pr-3 md:pb-3">
          <main
            className="h-full overflow-y-auto rounded-none md:rounded-2xl p-4 md:p-6 lg:p-8"
            style={{
              backgroundColor: "#FBFAF6",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
