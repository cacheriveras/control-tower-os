import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Activity, Brain, Calendar, ClipboardList, Compass, GitBranch,
  Layers, LogOut, ScrollText, Settings as SettingsIcon, Shield,
  Sparkles, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays, parseISO } from "date-fns";

const NAV = [
  { to: "/", label: "Command Center", icon: Activity, end: true },
  { to: "/focus", label: "Focus Mode", icon: Target },
  { to: "/roadmap", label: "Roadmap 8 semanas", icon: Calendar },
  { to: "/workstreams", label: "Workstreams", icon: Layers },
  { to: "/milestones", label: "Milestones", icon: ClipboardList },
  { to: "/compliance", label: "Compliance & Legal", icon: Shield },
  { to: "/weekly", label: "Weekly Review", icon: GitBranch },
  { to: "/decisions", label: "Decision Log", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppLayout() {
  const { workspace } = useWorkspace();
  const { user, signOut } = useAuth();
  const daysLeft = workspace ? differenceInDays(parseISO(workspace.target_date), new Date()) : null;

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gradient-navy text-sidebar-foreground">
        <div className="px-5 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/20 grid place-content-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base leading-tight truncate">{workspace?.name ?? "Control Tower"}</p>
              <p className="text-[11px] text-sidebar-foreground/60">
                {daysLeft !== null ? `${daysLeft} días restantes` : "Configurando..."}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`
              }
            >
              <n.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="text-[11px] text-sidebar-foreground/50 px-2 py-2 leading-snug">
            Workspace privado · no almacenar datos de pacientes
          </div>
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <span className="text-xs truncate text-sidebar-foreground/70">{user?.email}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={signOut} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* mobile nav */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded gradient-navy grid place-content-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display">{workspace?.name ?? "Control Tower"}</span>
          </div>
          <Button size="icon" variant="ghost" onClick={signOut} aria-label="Cerrar sesión"><LogOut className="h-4 w-4" /></Button>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b bg-card">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-md text-xs ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
