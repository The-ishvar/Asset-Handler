import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  School, Stethoscope, Store, Bus, ShoppingBag, Briefcase,
  Calendar, Bell, AlertTriangle, MapPin, Info, ArrowRight, Film,
} from "lucide-react";
import { useListEvents, useListNotices } from "@/lib/api";

const sections = [
  { name: "Shops",       path: "/shops",     icon: Store,         bg: "#2563EB" },
  { name: "Medical",     path: "/medical",   icon: Stethoscope,   bg: "#DC2626" },
  { name: "Jobs",        path: "/jobs",      icon: Briefcase,     bg: "#16A34A" },
  { name: "Schools",     path: "/schools",   icon: School,        bg: "#9333EA" },
  { name: "Reels",       path: "/reels",     icon: Film,          bg: "#DB2777" },
  { name: "Marketplace", path: "/buy-sell",  icon: ShoppingBag,   bg: "#EA580C" },
  { name: "Buses",       path: "/buses",     icon: Bus,           bg: "#CA8A04" },
  { name: "Events",      path: "/events",    icon: Calendar,      bg: "#0891B2" },
  { name: "Emergency",   path: "/emergency", icon: AlertTriangle, bg: "#DC2626" },
  { name: "Notices",     path: "/notices",   icon: Bell,          bg: "#7C3AED" },
  { name: "Village Map", path: "/map",       icon: MapPin,        bg: "#0D9488" },
  { name: "About",       path: "/about",     icon: Info,          bg: "#475569" },
];

export default function Home() {
  const { data: events } = useListEvents();
  const { data: notices } = useListNotices();

  const upcomingEvents = events?.slice(0, 3) ?? [];
  const recentNotices = notices?.slice(0, 3) ?? [];

  return (
    <div className="space-y-10">
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-emerald-600/70" />
        <div className="relative z-10 px-8 py-16 md:py-24 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Welcome to Bhaleri
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-2 text-white/90">
            भालेरी ऑनलाइन — आपका डिजिटल ग्राम पोर्टल
          </p>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-8 text-white/80">
            Find local services, connect with community, and stay updated with everything happening in Bhaleri.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg" asChild>
              <Link href="/schools">
                Explore Services <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 backdrop-blur-sm font-semibold" asChild>
              <Link href="/buy-sell/new">Post an Item</Link>
            </Button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-5 text-foreground">Quick Access</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sections.map((section) => (
            <Link key={section.name} href={section.path}>
              <div
                className="rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center py-5 px-2 gap-3 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                style={{ backgroundColor: section.bg }}
              >
                <section.icon className="w-8 h-8 text-white" strokeWidth={1.8} />
                <span className="font-semibold text-white text-xs md:text-sm leading-tight">{section.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" /> Upcoming Events
            </h2>
            <Link href="/events" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="font-semibold text-foreground line-clamp-1">{event.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {event.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming events.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" /> Recent Notices
            </h2>
            <Link href="/notices" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <Card key={notice.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="font-semibold text-foreground line-clamp-1">{notice.title}</div>
                    {notice.content && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent notices.</p>
            )}
          </div>
        </section>
      </div>

      <section>
        <Link href="/emergency">
          <div className="flex items-center gap-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-6 py-5 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer">
            <div className="p-3 bg-red-500 text-white rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-red-700 dark:text-red-400 text-lg">Emergency Contacts</div>
              <div className="text-sm text-red-600 dark:text-red-500">
                Hospital · Ambulance · Police · Electricity — tap for quick access
              </div>
            </div>
            <ArrowRight className="ml-auto w-5 h-5 text-red-400 shrink-0" />
          </div>
        </Link>
      </section>
    </div>
  );
}
