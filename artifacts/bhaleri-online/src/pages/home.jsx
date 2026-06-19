import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  School, Stethoscope, Store, Bus, ShoppingBag, Briefcase,
  Calendar, Bell, AlertTriangle, MapPin, Info, ArrowRight, Film,
  Users, MessageSquare, Camera, Search, UserSearch, Newspaper, Car, Ticket,
} from "lucide-react";
import { useListEvents, useListNotices, useListPosts } from "@/lib/api";
import AdsSection from "@/components/ads-section";
import StoriesSlider from "@/components/stories/StoriesSlider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

const sections = [
  { name: "Posts",       path: "/posts",       icon: Newspaper,     bg: "#2563EB" },
  { name: "Shops",       path: "/shops",       icon: Store,         bg: "#16A34A" },
  { name: "Book Auto",   path: "/book/auto",   icon: Car,           bg: "#EA580C" },
  { name: "Book Bus",    path: "/book/bus",    icon: Bus,           bg: "#CA8A04" },
  { name: "Book Event",  path: "/book/event",  icon: Ticket,        bg: "#0D9488" },
  { name: "Medical Apt", path: "/book/medical",icon: Stethoscope,   bg: "#DC2626" },
  { name: "Jobs",        path: "/jobs",        icon: Briefcase,     bg: "#9333EA" },
  { name: "Schools",     path: "/schools",     icon: School,        bg: "#0891B2" },
  { name: "Reels",       path: "/reels",       icon: Film,          bg: "#DB2777" },
  { name: "Marketplace", path: "/buy-sell",    icon: ShoppingBag,   bg: "#7C3AED" },
  { name: "Events",      path: "/events",      icon: Calendar,      bg: "#0891B2" },
  { name: "Village Map", path: "/map",         icon: MapPin,        bg: "#475569" },
  { name: "Snaps",       path: "/snaps",       icon: Camera,        bg: "#DB2777" },
  { name: "Emergency",   path: "/emergency",   icon: AlertTriangle, bg: "#B91C1C" },
];

export default function Home() {
  const { user } = useAuth();
  const { data: events } = useListEvents();
  const { data: notices } = useListNotices();
  const { data: posts } = useListPosts();

  const upcomingEvents = events?.slice(0, 3) ?? [];
  const recentNotices = notices?.slice(0, 2) ?? [];
  const recentPosts = posts?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-emerald-600/75" />
        <div className="relative z-10 px-6 py-14 md:py-20 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              🌿 भालेरी ऑनलाइन — डिजिटल ग्राम
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg leading-tight">
              Welcome to Bhaleri
            </h1>
            <p className="text-white/85 text-base md:text-lg mb-8">
              Apne gaon ke saath jude rahein — local services, community updates, aur bahut kuch
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg" asChild>
                <Link href="/posts">
                  <Newspaper className="w-4 h-4 mr-2" /> Community Posts
                </Link>
              </Button>
              {user ? (
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/15 font-semibold" asChild>
                  <Link href="/snaps"><Camera className="w-4 h-4 mr-2" /> Send a Snap</Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/15 font-semibold" asChild>
                  <Link href="/search"><UserSearch className="w-4 h-4 mr-2" /> Find People</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stories */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Stories</h2>
        </div>
        <StoriesSlider />
      </section>

      {/* Quick Access */}
      <section>
        <h2 className="text-xl font-bold mb-4">Quick Access</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
          {sections.map((section) => (
            <Link key={section.name} href={section.path}>
              <div
                className="rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center py-4 px-2 gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                style={{ backgroundColor: section.bg }}
              >
                <section.icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                <span className="font-semibold text-white text-[11px] md:text-xs leading-tight">{section.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* User Search bar */}
      <Link href="/search">
        <div className="flex items-center gap-3 bg-muted/60 hover:bg-muted border rounded-2xl px-5 py-3.5 cursor-pointer transition-colors group">
          <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-muted-foreground text-sm">Kisi bhi user ko dhoondein — naam ya phone se...</span>
          <UserSearch className="w-4 h-4 text-muted-foreground ml-auto" />
        </div>
      </Link>

      {/* Recent Community Posts */}
      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-500" /> Latest Posts
            </h2>
            <Link href="/posts" className="text-sm text-primary hover:underline flex items-center gap-1">
              Sab dekhein <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href="/posts">
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.userAvatar || ""} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {(post.userName || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold">{post.userName || "User"}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" /> Upcoming Events
            </h2>
            <Link href="/events" className="text-sm text-primary hover:underline">Sab dekhein</Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
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
            )) : (
              <p className="text-muted-foreground text-sm py-4 text-center bg-muted/20 rounded-xl border border-dashed">Koi upcoming event nahi.</p>
            )}
          </div>
        </section>

        {/* Notices */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" /> Recent Notices
            </h2>
            <Link href="/notices" className="text-sm text-primary hover:underline">Sab dekhein</Link>
          </div>
          <div className="space-y-3">
            {recentNotices.length > 0 ? recentNotices.map((notice) => (
              <Card key={notice.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="font-semibold text-foreground line-clamp-1">{notice.title}</div>
                  {notice.content && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-muted-foreground text-sm py-4 text-center bg-muted/20 rounded-xl border border-dashed">Koi notice nahi.</p>
            )}
          </div>
        </section>
      </div>

      <AdsSection max={3} title="Local Advertisements" />

      {/* Emergency banner */}
      <section>
        <Link href="/emergency">
          <div className="flex items-center gap-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-6 py-5 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors cursor-pointer">
            <div className="p-3 bg-red-500 text-white rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-red-700 dark:text-red-400 text-lg">Emergency Contacts</div>
              <div className="text-sm text-red-600 dark:text-red-500">Hospital · Ambulance · Police · Electricity</div>
            </div>
            <ArrowRight className="ml-auto w-5 h-5 text-red-400 shrink-0" />
          </div>
        </Link>
      </section>
    </div>
  );
}
