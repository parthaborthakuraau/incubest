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

  const w = collapsed ? "w-[72px]" : "w-[240px]";

  const isStartup = role === "startup";
  const sidebarBg = isStartup ? "bg-white border-gray-200/80" : "bg-[#e8e8e3] border-black/5";

  return (
    <aside className={cn("flex h-screen flex-col border-r transition-all duration-300", sidebarBg, w)}>
      {/* Logo row */}
      <div className="flex h-14 items-center justify-between px-3">
        <Link href={role === "incubator" ? "/incubator/dashboard" : "/startup"} className="flex items-center gap-2.5 overflow-hidden">
          <img src="/dark.svg" alt="Incubest" className="h-8 w-8 shrink-0 rounded-xl" />
          {!collapsed && <span className="text-sm font-bold text-gray-900 truncate">Incubest</span>}
        </Link>
        <button onClick={toggleCollapse} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors shrink-0">
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Role badge for team members */}
      {!collapsed && role === "incubator" && teamRole && (
        <div className="px-3 pb-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${teamRole === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
            {teamRole === "ADMIN" ? "Admin" : "Team Member"}
          </span>
        </div>
      )}

      {/* +New Chat */}
      {((role === "incubator" && !isInProgram && !isMember) || role === "startup") && (
        <div className="px-3 pb-2">
          <Link href="/chat?new=1">
            {collapsed ? (
              <div className={`flex h-9 w-full items-center justify-center rounded-xl text-white transition-all ${isStartup ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-900 hover:bg-gray-800"}`}>
                <Plus className="h-4 w-4" />
              </div>
            ) : (
              <div className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${isStartup ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-900 hover:bg-gray-800"}`}>
                <Plus className="h-4 w-4" /> {isStartup ? "Chat" : "New Chat"}
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Program context */}
      {isInProgram && !collapsed && (
        <div className="px-3 pb-2">
          <Link href="/incubator/programs" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-0.5">
            <ArrowLeft className="h-3 w-3" /> All Programs
          </Link>
          <p className="text-sm font-semibold text-gray-900 truncate">{activeProgramName || "Program"}</p>
        </div>
      )}
      {isInProgram && collapsed && (
        <div className="px-2 pb-2">
          <Link href="/incubator/programs" className="flex h-9 w-full items-center justify-center rounded-xl text-gray-400 hover:bg-black/5">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mx-3 border-t border-black/5 mb-2" />

      {/* Member redirect: show assigned program directly */}
      {isMember && !isInProgram && assignedProgramId && !collapsed && (
        <div className="px-3 pb-2">
          <Link href={`/incubator/programs/${assignedProgramId}`}>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-all">
              Go to Your Program
            </div>
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {links.map(link => {
          const active = isActive(link.href);
          // Members can only access their assigned program + settings
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
                isRestricted
                  ? "text-gray-300 cursor-not-allowed"
                  : active
                  ? isStartup
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                    : "bg-white text-gray-900 shadow-sm"
                  : isStartup
                    ? "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-black/5"
              )}
            >
              <link.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 hidden rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:block whitespace-nowrap z-50">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Programs quick list — members only see their assigned program */}
        {role === "incubator" && !isInProgram && programs.length > 0 && !collapsed && (
          <>
            <div className="pt-4 pb-1 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Programs</p>
            </div>
            {programs.filter(p => !isMember || p.id === assignedProgramId).map(p => {
              const active = pathname.startsWith(`/incubator/programs/${p.id}`);
              return (
                <Link key={p.id} href={`/incubator/programs/${p.id}`} title={collapsed ? p.name : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all",
                    active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-black/5"
                  )}>
                  <FolderKanban className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{p.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="mx-3 border-t border-black/5 mb-2" />
      <div className="px-3 pb-3 space-y-0.5">
        <Link href="/settings" title={collapsed ? "Settings" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all",
            collapsed && "justify-center px-0",
            pathname === "/settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-black/5"
          )}>
          <Settings className="h-[18px] w-[18px] shrink-0" />
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
      // For startups, try to get startup logo
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
      <button onClick={() => setOpen(!open)} title={collapsed ? (orgName || "Profile") : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all w-full text-gray-500 hover:text-gray-800 hover:bg-black/5",
          collapsed && "justify-center px-0"
        )}>
        {profile?.logo ? (
          <img src={profile.logo} alt="" className="h-6 w-6 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-200 text-[10px] font-bold text-gray-600 shrink-0">
            {(profile?.name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed && <span className="truncate text-gray-700">{profile?.name || orgName || "Profile"}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={cn(
            "absolute z-50 rounded-2xl border border-gray-200 bg-white shadow-xl p-4 w-64",
            collapsed ? "left-full bottom-0 ml-3" : "left-0 bottom-full mb-2"
          )}>
            <div className="flex items-center gap-3 mb-3">
              {profile?.logo ? (
                <img src={profile.logo} alt="" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                  {(profile?.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{profile?.email}</p>
                {orgName && <p className="text-[10px] text-gray-400 truncate">{orgName}</p>}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <button onClick={() => { window.location.href = "/api/auth/signout"; }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
