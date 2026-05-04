"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FileText, MessageSquare, GraduationCap,
  Settings, Building2, Landmark, CalendarDays, Briefcase, Award,
  Send, FolderKanban, ArrowLeft, Shield, ShoppingBag, Plus,
  PanelLeftClose, PanelLeftOpen, Target,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  role: "incubator" | "startup";
  orgName?: string;
  teamRole?: string | null;
  assignedProgramId?: string | null;
}

interface ProgramInfo { id: string; name: string; }

const incubatorLinks = [
  { href: "/incubator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incubator/programs", label: "Programs", icon: FolderKanban },
  { href: "/incubator/cohorts", label: "All Cohorts", icon: Users },
  { href: "/incubator/passport-search", label: "Passport Search", icon: Shield },
  { href: "/incubator/mentors", label: "Mentors", icon: GraduationCap },
  { href: "/incubator/events", label: "Events", icon: CalendarDays },
  { href: "/incubator/forms", label: "Forms", icon: FileText },
  { href: "/incubator/services", label: "Services", icon: ShoppingBag },
  { href: "/incubator/infrastructure", label: "Infrastructure", icon: Building2 },
  { href: "/incubator/alumni", label: "Alumni", icon: Award },
  { href: "/incubator/impact-dashboard", label: "Impact", icon: Target },
];

function getProgramLinks(pid: string) {
  const b = `/incubator/programs/${pid}`;
  return [
    { href: b, label: "Workspace", icon: LayoutDashboard },
    { href: `${b}/data-requests`, label: "Data Requests", icon: Send },
    { href: `${b}/grantor-reports`, label: "Grantor Reports", icon: Landmark },
    { href: "/incubator/mentors", label: "Mentors", icon: GraduationCap },
    { href: "/incubator/events", label: "Events", icon: CalendarDays },
  ];
}

const startupLinks = [
  { href: "/startup", label: "Dashboard", icon: LayoutDashboard },
  { href: "/startup/incubators", label: "My Incubators", icon: Building2 },
  { href: "/startup/reporting", label: "Reporting", icon: FileText },
  { href: "/startup/passport", label: "My Passport", icon: Shield },
  { href: "/startup/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/startup/my-startup", label: "My Startup", icon: Briefcase },
];

export function Sidebar({ role, orgName, teamRole, assignedProgramId }: SidebarProps) {
  const isMember = teamRole === "MEMBER";
  const pathname = usePathname();
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  const programMatch = pathname.match(/^\/incubator\/programs\/([^/]+)/);
  const activeProgramId = programMatch?.[1] || null;
  const isInProgram = !!activeProgramId && activeProgramId !== "undefined";

  useEffect(() => {
    if (role === "incubator") {
      fetch("/api/programs").then(r => r.json()).then(d => {
        if (Array.isArray(d)) setPrograms(d.map((p: ProgramInfo) => ({ id: p.id, name: p.name })));
      }).catch(() => {});
    }
  }, [role, pathname]);

  const activeProgramName = programs.find(p => p.id === activeProgramId)?.name;
  const links = role === "startup" ? startupLinks : isInProgram ? getProgramLinks(activeProgramId!) : incubatorLinks;

  function isActive(href: string) {
    if (href === "/chat") return pathname === "/chat";
    if (href === "/incubator/dashboard") return pathname === "/incubator/dashboard" || pathname === "/incubator";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const w = collapsed ? "w-[72px]" : "w-[248px]";
  const isStartup = role === "startup";

  return (
    <aside
      className={cn("flex h-screen flex-col border-r transition-all duration-300", w)}
      style={{
        backgroundColor: isStartup ? "#fff" : "#F4F1EA",
        borderColor: "rgba(0,0,0,0.08)",
        fontFamily: "'Geist', sans-serif",
      }}
    >
      {/* Logo row */}
      <div className="flex h-14 items-center justify-between px-3">
        <Link href={role === "incubator" ? "/incubator/dashboard" : "/startup"} className="flex items-center gap-2.5 overflow-hidden">
          {/* Brand mark */}
          <div className="relative h-[26px] w-[26px] rounded-md shrink-0 overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
            <div className="absolute inset-0" style={{
              background: "repeating-linear-gradient(45deg, transparent, transparent 3px, #D4FF3A 3px, #D4FF3A 5px)",
            }} />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: "#0A0A0A" }}>Incubest</span>
          )}
        </Link>
        <button onClick={toggleCollapse} className="rounded-lg p-1.5 transition-colors shrink-0 hover:bg-black/5" style={{ color: "#8A8A82" }}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && role === "incubator" && teamRole && (
        <div className="px-3 pb-1">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.06em",
              backgroundColor: teamRole === "ADMIN" ? "#D4FF3A20" : "#10B98120",
              color: teamRole === "ADMIN" ? "#5a7a00" : "#10B981",
            }}
          >
            {teamRole === "ADMIN" ? "Admin" : "Team Member"}
          </span>
        </div>
      )}

      {/* +New Chat button */}
      {((role === "incubator" && !isInProgram && !isMember) || role === "startup") && (
        <div className="px-3 pb-2">
          <Link href="/chat?new=1">
            {collapsed ? (
              <div
                className="flex h-9 w-full items-center justify-center rounded-xl text-white transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: "#0A0A0A" }}
              >
                <Plus className="h-4 w-4" />
              </div>
            ) : (
              <div
                className="relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all overflow-hidden hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#0A0A0A",
                  color: "#fff",
                  boxShadow: "0 4px 12px -4px rgba(0,0,0,0.3)",
                }}
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#D4FF3A", color: "#0A0A0A" }}
                >+</span>
                New chat
                <span
                  className="ml-auto text-[10px] opacity-50"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Ctrl+N
                </span>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Program context */}
      {isInProgram && !collapsed && (
        <div className="px-3 pb-2">
          <Link href="/incubator/programs" className="flex items-center gap-1 text-xs hover:opacity-70 mb-0.5" style={{ color: "#8A8A82" }}>
            <ArrowLeft className="h-3 w-3" /> All Programs
          </Link>
          <p className="text-sm font-semibold truncate" style={{ color: "#0A0A0A" }}>{activeProgramName || "Program"}</p>
        </div>
      )}
      {isInProgram && collapsed && (
        <div className="px-2 pb-2">
          <Link href="/incubator/programs" className="flex h-9 w-full items-center justify-center rounded-xl hover:bg-black/5" style={{ color: "#8A8A82" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mx-3 mb-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

      {/* Member redirect */}
      {isMember && !isInProgram && assignedProgramId && !collapsed && (
        <div className="px-3 pb-2">
          <Link href={`/incubator/programs/${assignedProgramId}`}>
            <div
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: "#D4FF3A20", border: "1px solid #D4FF3A40", color: "#5a7a00" }}
            >
              Go to Your Program
            </div>
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {links.map(link => {
          const active = isActive(link.href);
          const isRestricted = isMember && !isInProgram && link.href !== "/settings" && link.href !== "/incubator/dashboard";
          return (
            <Link
              key={link.href}
              href={isRestricted ? "#" : link.href}
              title={collapsed ? link.label : undefined}
              onClick={isRestricted ? (e: React.MouseEvent) => e.preventDefault() : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all",
                collapsed && "justify-center px-0",
              )}
              style={{
                color: isRestricted ? "#d4d4cc" : active ? "#0A0A0A" : "#5a5a55",
                backgroundColor: active ? (isStartup ? "#D4FF3A15" : "#0A0A0A") : "transparent",
                ...(active && !isStartup ? { color: "#fff" } : {}),
                cursor: isRestricted ? "not-allowed" : "pointer",
              }}
            >
              <link.icon className="h-[16px] w-[16px] shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 hidden rounded-lg px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:block whitespace-nowrap z-50" style={{ backgroundColor: "#0A0A0A" }}>
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Programs quick list */}
        {role === "incubator" && !isInProgram && programs.length > 0 && !collapsed && (
          <>
            <div className="pt-4 pb-1 px-1">
              <p
                className="text-[10px] font-semibold uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", color: "#8A8A82" }}
              >
                My Programs
              </p>
            </div>
            {programs.filter(p => !isMember || p.id === assignedProgramId).map(p => {
              const active = pathname.startsWith(`/incubator/programs/${p.id}`);
              return (
                <Link
                  key={p.id}
                  href={`/incubator/programs/${p.id}`}
                  title={collapsed ? p.name : undefined}
                  className="group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all"
                  style={{
                    color: active ? "#0A0A0A" : "#5a5a55",
                    backgroundColor: active ? "#0A0A0A" : "transparent",
                    ...(active ? { color: "#fff" } : {}),
                  }}
                >
                  <FolderKanban className="h-[16px] w-[16px] shrink-0" />
                  <span className="truncate">{p.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="mx-3 mb-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />
      <div className="px-3 pb-3 space-y-0.5">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all",
            collapsed && "justify-center px-0",
          )}
          style={{
            color: pathname === "/settings" ? "#fff" : "#5a5a55",
            backgroundColor: pathname === "/settings" ? "#0A0A0A" : "transparent",
          }}
        >
          <Settings className="h-[16px] w-[16px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <ProfileButton collapsed={collapsed} orgName={orgName} />
      </div>
    </aside>
  );
}

function ProfileButton({ collapsed, orgName }: { collapsed: boolean; orgName?: string }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; logo: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      let logo = d.organization?.logo || null;
      if (d.user?.role === "STARTUP_FOUNDER") {
        fetch("/api/startup/dashboard").then(r2 => r2.json()).then(d2 => {
          if (d2.activeStartup?.logo) {
            setProfile(p => p ? { ...p, logo: d2.activeStartup.logo } : p);
          }
        }).catch(() => {});
      }
      setProfile({ name: d.user?.name || "", email: d.user?.email || "", logo });
    }).catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? (orgName || "Profile") : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all w-full hover:bg-black/5",
          collapsed && "justify-center px-0"
        )}
        style={{ color: "#5a5a55" }}
      >
        {profile?.logo ? (
          <img src={profile.logo} alt="" className="h-7 w-7 rounded-lg object-cover shrink-0" />
        ) : (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #D4FF3A, #A7F3D0)", color: "#0A0A0A" }}
          >
            {(profile?.name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed && (
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "#0A0A0A" }}>{profile?.name || "Profile"}</p>
            <p className="text-[10px] truncate" style={{ color: "#8A8A82" }}>{orgName || profile?.email}</p>
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "absolute z-50 rounded-2xl shadow-xl p-4 w-64",
              collapsed ? "left-full bottom-0 ml-3" : "left-0 bottom-full mb-2"
            )}
            style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              {profile?.logo ? (
                <img src={profile.logo} alt="" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #D4FF3A, #A7F3D0)", color: "#0A0A0A" }}
                >
                  {(profile?.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#0A0A0A" }}>{profile?.name}</p>
                <p className="text-[11px] truncate" style={{ color: "#8A8A82" }}>{profile?.email}</p>
                {orgName && <p className="text-[10px] truncate" style={{ color: "#8A8A82" }}>{orgName}</p>}
              </div>
            </div>
            <div className="pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => { window.location.href = "/api/auth/signout"; }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors"
                style={{ color: "#FF7A45" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
