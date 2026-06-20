import { useRoute, Link } from "wouter";
import { useGetUserProfile, useToggleFollow, useListReels, useListListings } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Play, MessageCircle, UserCheck, UserPlus, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PublicProfile() {
  const [, params] = useRoute("/profile/:id");
  const profileId = Number(params?.id);
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useGetUserProfile(profileId, { enabled: !!profileId });
  const { data: reels } = useListReels({ userId: profileId }, { enabled: !!profileId });
  const { data: listings } = useListListings({ userId: profileId }, { enabled: !!profileId });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const toggleFollow = useToggleFollow();

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.isFollowing ?? false);
      setFollowerCount(profile.followerCount ?? 0);
    }
  }, [profile]);

  const handleFollow = () => {
    if (!user) { toast({ title: "Follow karne ke liye login karein", variant: "destructive" }); return; }
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowerCount((c) => prev ? c - 1 : c + 1);
    toggleFollow.mutate({ id: profileId }, {
      onSuccess: (d) => { setIsFollowing(d.following); setFollowerCount(d.followerCount); },
      onError: () => { setIsFollowing(prev); setFollowerCount(followerCount); },
    });
  };

  const isOwnProfile = user?.id === profileId;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="flex gap-4 items-end px-4">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20 text-muted-foreground">User not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative h-40 md:h-52 bg-gradient-to-br from-primary/20 to-emerald-400/20 rounded-xl overflow-hidden">
        {profile.coverUrl && <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />}
      </div>

      <div className="relative px-4 pb-4 border-b">
        <div className="flex items-end justify-between -mt-12">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile.avatarUrl || ""} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2 pb-1">
            {!isOwnProfile && (
              <>
                <Link href={`/messages/${profileId}`}>
                  <Button size="sm" variant="outline"><MessageCircle className="w-3.5 h-3.5 mr-1" /> Message</Button>
                </Link>
                <Button size="sm" onClick={handleFollow} disabled={toggleFollow.isPending}>
                  {isFollowing ? <><UserCheck className="w-3.5 h-3.5 mr-1" /> Following</> : <><UserPlus className="w-3.5 h-3.5 mr-1" /> Follow</>}
                </Button>
              </>
            )}
            {isOwnProfile && (
              <Link href="/profile"><Button size="sm" variant="outline">Edit Profile</Button></Link>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            {profile.role === "admin" && <Badge className="bg-indigo-100 text-indigo-800">Admin</Badge>}
            {profile.role === "super_admin" && <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>}
          </div>
          {profile.bio && <p className="text-muted-foreground text-sm">{profile.bio}</p>}
          {profile.phone && (isOwnProfile || user?.role === "admin" || user?.role === "super_admin") && (
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone}</span>
            </div>
          )}
          <div className="flex gap-5 pt-2 text-sm">
            <div className="text-center"><div className="font-bold">{followerCount}</div><div className="text-muted-foreground text-xs">Followers</div></div>
            <div className="text-center"><div className="font-bold">{profile.followingCount}</div><div className="text-muted-foreground text-xs">Following</div></div>
            <div className="text-center"><div className="font-bold">{profile.postCount}</div><div className="text-muted-foreground text-xs">Listings</div></div>
            <div className="text-center"><div className="font-bold">{profile.reelCount}</div><div className="text-muted-foreground text-xs">Reels</div></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0 justify-start">
          <TabsTrigger value="listings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm">
            <Package className="w-4 h-4 mr-1.5" /> Listings
          </TabsTrigger>
          <TabsTrigger value="reels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm">
            <Play className="w-4 h-4 mr-1.5" /> Reels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="p-4 mt-0">
          {!listings?.length ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Koi listing nahi.</div>
          ) : (
            <div className="space-y-3">
              {listings.filter((l) => l.status === "approved").map((l) => (
                <Link key={l.id} href={`/buy-sell/${l.id}`}>
                  <div className="flex gap-4 p-4 border rounded-xl hover:bg-muted/20 transition-colors cursor-pointer">
                    <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden shrink-0">
                      {l.photoUrl ? <img src={l.photoUrl} alt={l.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/30" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{l.title}</div>
                      <div className="text-primary font-bold text-sm">₹{Number(l.price).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reels" className="p-4 mt-0">
          {!reels?.length ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No reels yet.</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {reels.map((reel) => (
                <Link key={reel.id} href="/reels">
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative group cursor-pointer">
                    {reel.thumbnailUrl ? <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Play className="w-8 h-8 text-muted-foreground/40" /></div>}
                    <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium line-clamp-1 drop-shadow">{reel.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
