import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Home, Search, PlusCircle, Bell, User as UserIcon, Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Buy & Sell", href: "/buy-sell" },
    { label: "Jobs", href: "/jobs" },
    { label: "Events", href: "/events" },
    { label: "Village Map", href: "/map" },
    { label: "About", href: "/about" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-16 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <Link href="/" className="mr-6 flex items-center space-x-2 shrink-0">
            <span className="font-bold text-lg text-primary">🏡 Bhaleri Online</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <nav className="flex items-center space-x-5 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-foreground ${
                    location === link.href ? "text-foreground font-semibold" : "text-foreground/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle dark mode">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin" className="text-sm font-medium text-orange-600 hover:underline">
                      Admin
                    </Link>
                  )}
                  <Link href="/profile" className="text-sm font-medium hover:underline">
                    {user.name?.split(" ")[0] || "Profile"}
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium hover:underline text-foreground/70">
                    Login
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile: dark mode + hamburger */}
          <div className="flex items-center gap-1 ml-auto md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen((v) => !v)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                  location === link.href ? "text-primary bg-primary/5" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                  <Button size="sm" variant="outline" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 container max-w-screen-2xl mx-auto py-6 md:py-8 px-4">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex justify-around items-center h-16 safe-area-pb">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/search" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${location === "/search" ? "text-primary" : "text-muted-foreground"}`}>
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </Link>
        <Link href="/buy-sell/new" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${location === "/buy-sell/new" ? "text-primary" : "text-muted-foreground"}`}>
          <div className="bg-primary rounded-full p-2 -mt-4">
            <PlusCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-[10px] mt-1">Post</span>
        </Link>
        <Link href="/notices" className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${location === "/notices" ? "text-primary" : "text-muted-foreground"}`}>
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Notices</span>
        </Link>
        <Link href={user ? "/profile" : "/login"} className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${location === "/profile" || location === "/login" ? "text-primary" : "text-muted-foreground"}`}>
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">{user ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  );
}
