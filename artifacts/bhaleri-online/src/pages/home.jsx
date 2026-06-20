import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useFeatures } from "@/lib/features";
import {
  School, Stethoscope, Store, Bus, ShoppingBag, Briefcase,
  Calendar, Bell, AlertTriangle, MapPin, Info, ArrowRight, Film,
  Users, MessageSquare, Camera, Search, UserSearch, Newspaper, Car, Ticket,
} from "lucide-react";
import { useListEvents, useListNotices, useListPosts, useSearchUsers } from "@/lib/api";
import AdsSection from "@/components/ads-section";
import StoriesSlider from "@/components/stories/StoriesSlider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

const ALL_SECTIONS = [
  { name: "Posts",       path: "/posts",        icon: Newspaper,     bg: "#2563EB", featureKey: "posts" },
  { name: "Shops",       path: "/shops",        icon: Store,         bg: "#16A34A", featureKey: "shops" },
  { name: "Book Auto",   path: "/book/auto",    icon: Car,           bg: "#EA580C", featureKey: "autoBooking" },
  { name: "Book Bus",    path: "/book/bus",     icon: Bus,           bg: "#CA8A04", featureKey: "busBooking" },
  { name: "Book Event",  path: "/book/event",   icon: Ticket,        bg: "#0D9488", featureKey: "bookEvent" },
  { name: "Medical Apt", path: "/book/medical", icon: Stethoscope,   bg: "#DC2626", featureKey: "medical" },
  { name: "Jobs",        path: "/jobs",         icon: Briefcase,     bg: "#9333EA", featureKey: "jobs" },
  { name: "Schools",     path: "/schools",      icon: School,        bg: "#0891B2", featureKey: "schools" },
  { name: "Reels",       path: "/reels",        icon: Film,          bg: "#DB2777", featureKey: "reels" },
  { name: "Marketplace", path: "/buy-sell",     icon: ShoppingBag,   bg: "#7C3AED", featureKey: "marketplace" },
  { name: "Events",      path: "/events",       icon: Calendar,      bg: "#0891B2", featureKey: "events" },
  { name: "Village Map", path: "/map",          icon: MapPin,        bg: "#475569", featureKey: "map" },
  { name: "Snaps",       path: "/snaps",        icon: Camera,        bg: "#DB2777", featureKey: "snaps" },
  { name: "Emergency",   path: "/emergency",    icon: AlertTriangle, bg: "#B91C1C", featureKey: "emergency" },
];

export default function Home() {
  const { user } = useAuth();
  const { isEnabled } = useFeatures();
  const [, setLocation] = useLocation();
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const { data: events } = useListEvents({ enabled: isEnabled("events") });
  const { data: notices } = useListNotices({ enabled: isEnabled("notices") });
  const { data: posts } = useListPosts({ enabled: isEnabled("posts") });
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(debouncedQ, { enabled: debouncedQ.length >= 2 });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ), 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  const upcomingEvents = events?.slice(0, 3) ?? [];
  const recentNotices = notices?.slice(0, 2) ?? [];
  const recentPosts = posts?.slice(0, 3) ?? [];

  const sections = ALL_SECTIONS.filter((s) => isEnabled(s.featureKey));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-emerald-600/75" />
        <div className="relative z-10 px-6 py-10 md:py-16 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              🌿 भालेरी ऑनलाइन — डिजिटल ग्राम
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight">
              Welcome to Bhaleri
            </h1>

            {/* Search bar */}
            <div className="relative mx-auto max-w-md mb-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 focus-within:bg-white/30 transition-all">
                <Search className="w-4 h-4 text-white/70 shrink-0" />
                <input
                  type="text"
                  placeholder="User naam se dhoondein…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/60 text-white"
                />
                {searchQ && (
                  <button onClick={() => { setSearchQ(""); setDebouncedQ(""); }} className="text-white/60 hover:text-white text-xs px-1">✕</button>
                )}
              </div>

              {debouncedQ.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-2xl shadow-lg z-30 overflow-hidden max-h-72 overflow-y-auto text-left">
                  {searchLoading ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">Dhoond raha hai…</div>
                  ) : searchResults?.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">"{debouncedQ}" naam ka koi user nahi mila</div>
                  ) : (
                    <div className="divide-y">
                      {searchResults?.map((person) => (
                        <button
                          key={person.id}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                          onClick={() => { setSearchQ(""); setDebouncedQ(""); setLocation(`/profile/${person.id}`); }}
                        >
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={person.avatarUrl || ""} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {person.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{person.name}</div>
                            {person.section && <div className="text-xs text-muted-foreground truncate">{person.section}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isEnabled("posts") && (
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg" asChild>
                  <Link href="/posts">
                    <Newspaper className="w-4 h-4 mr-2" /> Community Posts
                  </Link>
                </Button>
              )}
              {user ? (
                isEnabled("snaps") && (
                  <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/15 font-semibold" asChild>
                    <Link href="/snaps"><Camera className="w-4 h-4 mr-2" /> Send a Snap</Link>
                  </Button>
                )
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
      {isEnabled("stories") && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Stories</h2>
          </div>
          <StoriesSlider />
        </section>
      )}

      {/* Quick Access */}
      {sections.length > 0 && (
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
      )}

      {/* Recent Community Posts */}
      {isEnabled("posts") && recentPosts.length > 0 && (
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

      {(isEnabled("events") || isEnabled("notices")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Events */}
          {isEnabled("events") && (
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
          )}

          {/* Notices */}
          {isEnabled("notices") && (
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
          )}
        </div>
      )}

      <AdsSection max={3} title="Local Advertisements" />

      {/* Emergency banner */}
      {isEnabled("emergency") && (
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
      )}
    </div>
  );
}
