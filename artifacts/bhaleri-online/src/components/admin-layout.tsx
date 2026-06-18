import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  School, 
  Stethoscope, 
  Store, 
  ShoppingBag, 
  Bus, 
  Briefcase, 
  Calendar, 
  Bell, 
  AlertTriangle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const adminNavItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Schools", path: "/admin/schools", icon: School },
  { name: "Medical", path: "/admin/medical", icon: Stethoscope },
  { name: "Shops", path: "/admin/shops", icon: Store },
  { name: "Listings", path: "/admin/listings", icon: ShoppingBag },
  { name: "Buses", path: "/admin/buses", icon: Bus },
  { name: "Jobs", path: "/admin/jobs", icon: Briefcase },
  { name: "Events", path: "/admin/events", icon: Calendar },
  { name: "Notices", path: "/admin/notices", icon: Bell },
  { name: "Emergency", path: "/admin/emergency", icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not admin, redirect or show error
  if (!user || user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-sm transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        <div className="p-4 border-b flex justify-between items-center h-14">
          <Link href="/admin" className="font-bold text-lg text-primary flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Panel
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {adminNavItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.name} href={item.path}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : ""}`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/">
              Return to App
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <header className="h-14 bg-card border-b flex items-center px-4 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="font-semibold text-lg md:hidden">Bhaleri Admin</div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Need to import Shield for the header
import { Shield } from "lucide-react";
