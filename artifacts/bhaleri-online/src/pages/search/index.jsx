import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, UserSearch, ArrowRight, MessageCircle, Camera, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchUsers } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToggleFollow, useGetUserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const quickLinks = [
  { name: "Community Posts", path: "/posts" },
  { name: "Buy & Sell",      path: "/buy-sell" },
  { name: "Jobs",            path: "/jobs" },
  { name: "Shops",           path: "/shops" },
  { name: "Medical Stores",  path: "/medical" },
  { name: "Bus Timetable",   path: "/buses" },
  { name: "Events",          path: "/events" },
  { name: "Notices",         path: "/notices" },
  { name: "Snaps",           path: "/snaps" },
  { name: "Emergency",       path: "/emergency" },
];

function UserCard({ person, currentUser }) {
  const { toast } = useToast();
  const toggleFollow = useToggleFollow();
  const [following, setFollowing] = useState(false);

  const handleFollow = () => {
    if (!currentUser) { toast({ title: "Login karein follow karne ke liye", variant: "destructive" }); return; }
    setFollowing(!following);
    toggleFollow.mutate({ id: person.id });
  };

  const isMe = currentUser?.id === person.id;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${person.id}`}>
            <Avatar className="w-12 h-12 cursor-pointer">
              <AvatarImage src={person.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {person.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${person.id}`}>
              <div className="font-semibold hover:text-primary cursor-pointer truncate">{person.name}</div>
            </Link>
            {person.phone && (currentUser?.id === person.id || currentUser?.role === "admin" || currentUser?.role === "super_admin") && (
              <div className="text-xs text-muted-foreground">📱 {person.phone}</div>
            )}
          </div>
          {!isMe && (
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/snaps?to=${person.id}&name=${encodeURIComponent(person.name)}`}>
                <Button size="icon" variant="outline" className="h-8 w-8" title="Snap bhejein">
                  <Camera className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href={`/messages/${person.id}`}>
                <Button size="icon" variant="outline" className="h-8 w-8" title="Message bhejein">
                  <MessageCircle className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant={following ? "secondary" : "default"}
                className="h-8 text-xs"
                onClick={handleFollow}
                disabled={toggleFollow.isPending}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                {following ? "Following" : "Follow"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: users, isLoading } = useSearchUsers(debouncedQ, { enabled: debouncedQ.length >= 2 });

  const showUserSearch = debouncedQ.length >= 2;
  const filteredLinks = quickLinks.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          className="pl-12 h-14 text-base rounded-xl shadow-sm"
          placeholder="User naam, phone ya section dhoondein..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* User search results */}
      {showUserSearch && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserSearch className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Bhaleri Users
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <Card key={i}><CardContent className="p-4 flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
                </CardContent></Card>
              ))}
            </div>
          ) : users?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <UserSearch className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">"{debouncedQ}" naam ka koi user nahi mila</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((person) => (
                <UserCard key={person.id} person={person} currentUser={user} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      {!showUserSearch && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider px-1">
            {query ? "Sections" : "Quick Links"}
          </h2>
          <div className="grid gap-2">
            {filteredLinks.length > 0 ? filteredLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-transparent hover:border-border shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{link.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                "{query}" ke liye koi result nahi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
