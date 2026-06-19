import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, ShoppingBag, School, Stethoscope,
  Store, Bus, Briefcase, Calendar, Bell, AlertTriangle, LogOut, ArrowLeft
} from "lucide-react";
import { Button } from "./ui/button";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Listings", href: "/admin/listings", icon: ShoppingBag },
  { label: "Schools", href: "/admin/schools", icon: School },
  { label: "Medical", href: "/admin/medical", icon: Stethoscope },
  { label: "Shops", href: "/admin/shops", icon: Store },
  { label: "Buses", href: "/admin/buses", icon: Bus },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Notices", href: "/admin/notices", icon: Bell },
  { label: "Emergency", href: "/admin/emergency", icon: AlertTriangle },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 fixed h-screen">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="w-4 h-4" />
            🏡 Bhaleri Admin
          </Link>
          <div className="mt-2 text-xs text-muted-foreground">{user.name}</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/70 hover:text-foreground"
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        <div className="md:hidden sticky top-0 z-50 border-b bg-background px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-primary font-bold text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
          <span className="font-semibold text-sm">Admin Panel</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <div className="md:hidden overflow-x-auto border-b">
          <div className="flex px-4 py-2 gap-1 min-w-max">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
