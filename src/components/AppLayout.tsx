import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate, Link } from "react-router";
import {
  Home,
  Star,
  FileText,
  Users,
  GraduationCap,
  UserCheck,
  Settings,
  BarChart3,
  LogOut,
  BookOpen,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ReactNode } from "react";

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

const studentNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/student/dashboard" },
  { icon: Star, label: "My Preferences", path: "/student/preferences" },
  { icon: FileText, label: "My Results", path: "/student/results" },
];

const supervisorNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/supervisor/dashboard" },
  { icon: Users, label: "My Allocations", path: "/supervisor/allocations" },
];

const adminNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
  { icon: GraduationCap, label: "Students", path: "/admin/students" },
  { icon: UserCheck, label: "Supervisors", path: "/admin/supervisors" },
  { icon: Settings, label: "Allocations", path: "/admin/allocations" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
];

type UserRole = "student" | "supervisor" | "admin";

function getNavItems(role?: UserRole): NavItem[] {
  switch (role) {
    case "student":
      return studentNavItems;
    case "supervisor":
      return supervisorNavItems;
    case "admin":
      return adminNavItems;
    default:
      return [];
  }
}

function getRoleFromPath(path: string): UserRole {
  if (path.startsWith("/student")) return "student";
  if (path.startsWith("/supervisor")) return "supervisor";
  if (path.startsWith("/admin")) return "admin";
  return "admin";
}

import { ModeToggle } from "@/components/mode-toggle";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRole = getRoleFromPath(location.pathname);
  const navItems = getNavItems(currentRole);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please sign in to continue</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Top bar (Global) */}
      <header className="print:hidden h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">
              SuperMatch
            </span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* User Info */}
          <div className="hidden sm:flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
              Role: {currentRole}
            </span>
            <span className="text-slate-300 dark:text-slate-700 mx-2">|</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
              {user.name}
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <LogOut className="w-4 h-4 mr-2 hidden sm:block" />
            <span className="sm:hidden">Logout</span>
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`print:hidden absolute lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Sidebar Header */}
          <div className="h-16 flex items-center px-4 border-b border-slate-200 lg:hidden">
            <span className="text-lg font-bold text-slate-900">Menu</span>
            <button
              className="ml-auto p-1 rounded hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-slate-50">
          {/* Main Content Header (SuperMatch > Current Page) */}
          <div className="mb-6 flex items-center text-sm text-slate-500">
            <span>SuperMatch</span>
            <span className="mx-2">›</span>
            <span className="font-medium text-slate-900">
              {navItems.find((item) => location.pathname.startsWith(item.path))?.label || "Dashboard"}
            </span>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}
