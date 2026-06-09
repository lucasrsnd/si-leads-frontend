"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Users,
  Columns,
  LogOut,
  Menu,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../lib/auth-store";
import { cn } from "../../lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kanban", label: "Kanban", icon: Columns },
  { href: "/leads", label: "Leads", icon: Users },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, init } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    init();
    const saved = localStorage.getItem("si_theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("si_theme", next ? "dark" : "light");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-60 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--text)] leading-tight">
              SI Imobiliárias
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Soluções Imobiliárias
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "text-white shadow-md"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                )}
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border)] space-y-0.5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-all"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? "Modo claro" : "Modo escuro"}
          </button>
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-[var(--text)] truncate">
              {user?.name}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-[var(--text)]" />
          </button>
          <span className="font-semibold text-[var(--text)]">
            SI Imobiliárias
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
