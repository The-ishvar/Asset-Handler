import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Menu, Home, Search, PlusCircle, Bell, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-16 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">Bhaleri Online</span>
          </Link>
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
              <Link href="/buy-sell" className="transition-colors hover:text-foreground/80 text-foreground/60">Buy & Sell</Link>
            </nav>
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <Link href="/profile" className="text-sm font-medium hover:underline">Profile</Link>
                  <Button variant="ghost" onClick={logout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl mx-auto py-6 md:py-8 px-4">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex justify-around items-center h-16">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </Link>
        <Link href="/search" className={`flex flex-col items-center justify-center w-full h-full ${location === '/search' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1">Search</span>
        </Link>
        <Link href="/buy-sell/new" className={`flex flex-col items-center justify-center w-full h-full ${location === '/buy-sell/new' ? 'text-primary' : 'text-muted-foreground'}`}>
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] mt-1">Post</span>
        </Link>
        <Link href="/notices" className={`flex flex-col items-center justify-center w-full h-full ${location === '/notices' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Bell className="w-5 h-5" />
          <span className="text-[10px] mt-1">Notices</span>
        </Link>
        <Link href={user ? "/profile" : "/login"} className={`flex flex-col items-center justify-center w-full h-full ${location === '/profile' || location === '/login' ? 'text-primary' : 'text-muted-foreground'}`}>
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
