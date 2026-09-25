import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Plus,
  Menu,
  X,
  PanelLeftClose,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { isOverdue } from "@/lib/calc";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/clients", label: "Clients", icon: Users },
];

const BrandMark = () => (
  <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
    <svg
      viewBox="0 0 32 32"
      className="size-6"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 8.5h8.2l4.8 4.8v10.4a1.2 1.2 0 0 1-1.2 1.2H9.5a1.2 1.2 0 0 1-1.2-1.2V9.7A1.2 1.2 0 0 1 9.5 8.5Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M17.4 8.6v5h5" fill="currentColor" opacity="0.55" />
      <path
        d="M12.6 17.6l1.9 1.9 3.9-3.9"
        stroke="#4F46E5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const NavList = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { invoices } = useStore();
  const overdueCount = invoices.filter(isOverdue).length;

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <Icon className="size-4" />
          {label}
          {to === "/invoices" && overdueCount > 0 ? (
            <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-xs font-semibold text-destructive">
              {overdueCount}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
};

const SidebarHeader = () => (
  <Link
    to="/"
    className="flex items-center gap-2.5 rounded-lg px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <BrandMark />
    <div className="flex flex-col leading-tight">
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Billable
      </span>
      <span className="text-xs text-muted-foreground">Invoice tracker</span>
    </div>
  </Link>
);

export const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderMobileTrigger = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-5">
        <div className="flex items-center justify-between">
          <SidebarHeader />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="mt-6">
          <NavList onNavigate={() => setMobileOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <div className="flex h-full flex-col gap-6 p-5">
          <SidebarHeader />
          <div className="flex flex-col gap-3">
            <NavList />
            <Button asChild className="mt-1 w-full justify-start gap-2">
              <Link to="/invoices/new">
                <Plus className="size-4" />
                New invoice
              </Link>
            </Button>
          </div>
          <div className="mt-auto border-t border-border pt-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Sample workspace
              <br />
              Data saves to this browser only.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          {renderMobileTrigger()}
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[15px] font-semibold tracking-tight">
              Billable
            </span>
          </Link>
          <div className="ml-auto">
            <Button asChild size="sm">
              <Link to="/invoices/new">
                <Plus className="size-4" />
                New
              </Link>
            </Button>
          </div>
        </header>

        {/* Desktop slim top bar */}
        <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-border bg-background/70 px-8 backdrop-blur lg:flex">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PanelLeftClose className="size-4" />
            <span className="truncate">
              {location.pathname === "/" ? "Dashboard" : labelFor(location.pathname)}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/clients/new">Add client</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/invoices/new">
                <Plus className="size-4" />
                New invoice
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const labelFor = (pathname: string): string => {
  if (pathname.startsWith("/invoices")) return "Invoices";
  if (pathname.startsWith("/clients")) return "Clients";
  return "Billable";
};
