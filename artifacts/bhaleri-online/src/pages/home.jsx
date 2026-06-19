import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  School, Stethoscope, Store, Bus, ShoppingBag, Briefcase,
  Calendar, Bell, AlertTriangle, MapPin, Info, ArrowRight,
} from "lucide-react";
import { useListEvents, useListNotices } from "@/lib/api";

const sections = [
  { name: "Schools", path: "/schools", icon: School, color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { name: "Medical", path: "/medical", icon: Stethoscope, color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
  { name: "Shops", path: "/shops", icon: Store, color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { name: "Bus", path: "/buses", icon: Bus, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  { name: "Buy & Sell", path: "/buy-sell", icon: ShoppingBag, color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { name: "Jobs", path: "/jobs", icon: Briefcase, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  { name: "Events", path: "/events", icon: Calendar, color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  { name: "Notices", path: "/notices", icon: Bell, color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  { name: "Emergency", path: "/emergency", icon: AlertTriangle, color: "bg-red-500 text-white" },
  { name: "Village Map", path: "/map", icon: MapPin, color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
  { name: "About", path: "/about", icon: Info, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
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
        <h2 className="text-2xl font-bold mb-5 text-foreground">Services & Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <Link key={section.name} href={section.path}>
              <Card className="hover:shadow-md cursor-pointer border border-border hover:border-primary/40 transition-all h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
                  <div className={`p-4 rounded-full ${section.color}`}>
                    <section.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{section.name}</h3>
                </CardContent>
              </Card>
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
