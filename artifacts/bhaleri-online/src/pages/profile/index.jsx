import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useListListings, useListReels, usePatchMyProfile, useUpdateUser } from "@/lib/api";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, Settings, LogOut, Shield, Plus, Play, Edit3, Phone, Mail } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { user, logout, login, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState("listings");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl || "");

  const { data: myListings, isLoading: listingsLoading } = useListListings(
    { userId: user?.id },
    { enabled: !!user?.id }
  );
  const { data: myReels, isLoading: reelsLoading } = useListReels(
    { userId: user?.id },
    { enabled: !!user?.id }
  );

  const updateUser = useUpdateUser();
  const patchProfile = usePatchMyProfile();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleSave = (e) => {
    e.preventDefault();
    updateUser.mutate(
      { id: user.id, data: { name, phone } },
      {
        onSuccess: (updated) => {
          patchProfile.mutate(
            { bio: bio || null, avatarUrl: avatarUrl || null, coverUrl: coverUrl || null },
            {
              onSuccess: () => {
                if (token) login(token, { ...updated, avatarUrl: avatarUrl || null });
                setIsEditing(false);
                toast({ title: "Profile updated!" });
                qc.invalidateQueries({ queryKey: ["listReels"] });
              },
            }
          );
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: <Badge className="bg-green-100 text-green-800">Approved</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
      pending: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>,
    };
    return badges[status] ?? badges.pending;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-0">
      <div className="relative h-40 md:h-56 bg-gradient-to-br from-primary/30 to-emerald-400/30 rounded-b-none rounded-xl overflow-hidden">
        {user.coverUrl && <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

      <div className="relative px-4 pb-4 border-b">
        <div className="flex items-end justify-between -mt-14">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2 pb-1">
            {(user.role === "admin" || user.role === "super_admin") && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{user.name}</h2>
            {user.role === "admin" && <Badge className="bg-indigo-100 text-indigo-800"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>}
            {user.role === "super_admin" && <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" /> Super Admin</Badge>}
          </div>
          {user.bio && <p className="text-muted-foreground text-sm">{user.bio}</p>}
          <div className="flex gap-3 text-sm text-muted-foreground flex-wrap">
            {user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>}
          </div>
          <div className="flex gap-5 pt-2 text-sm">
            <div className="text-center">
              <div className="font-bold">{myListings?.length ?? 0}</div>
              <div className="text-muted-foreground text-xs">Listings</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{myReels?.length ?? 0}</div>
              <div className="text-muted-foreground text-xs">Reels</div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <Card className="mx-0 rounded-none border-x-0">
          <CardContent className="pt-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the Bhaleri community about yourself..." rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Profile Photo URL</Label>
                <Input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
              </div>
              <div className="space-y-1.5">
                <Label>Cover Photo URL</Label>
                <Input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://example.com/cover.jpg" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={updateUser.isPending || patchProfile.isPending}>
                  {updateUser.isPending || patchProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0 justify-start">
          <TabsTrigger value="listings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm">
            <Package className="w-4 h-4 mr-1.5" /> Listings
          </TabsTrigger>
          <TabsTrigger value="reels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm">
            <Play className="w-4 h-4 mr-1.5" /> Reels
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm">
            <Settings className="w-4 h-4 mr-1.5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="p-4 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Your Listings</h3>
            <Button size="sm" asChild><Link href="/buy-sell/new"><Plus className="w-3.5 h-3.5 mr-1" /> New</Link></Button>
          </div>
          {listingsLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : !myListings?.length ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">No listings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing) => (
                <Link key={listing.id} href={`/buy-sell/${listing.id}`}>
                  <div className="flex gap-4 p-4 border rounded-xl hover:bg-muted/20 transition-colors cursor-pointer">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      {(() => { let ph = listing.photoUrl; try { const a = JSON.parse(ph); ph = Array.isArray(a) ? a[0] : ph; } catch {} return ph ? <img src={ph} alt={listing.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground/30" /></div>; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold truncate">{listing.title}</h4>
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="text-primary font-bold text-sm mt-1">₹{Number(listing.price).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reels" className="p-4 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Your Reels</h3>
            <Button size="sm" asChild><Link href="/reels/new"><Plus className="w-3.5 h-3.5 mr-1" /> New</Link></Button>
          </div>
          {reelsLoading ? (
            <div className="grid grid-cols-3 gap-2">{[1,2,3,4,5,6].map((i) => <div key={i} className="aspect-[9/16] bg-muted animate-pulse rounded-lg" />)}</div>
          ) : !myReels?.length ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <Play className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">No reels posted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {myReels.map((reel) => (
                <Link key={reel.id} href="/reels">
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative cursor-pointer group">
                    {reel.thumbnailUrl ? <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Play className="w-8 h-8 text-muted-foreground/40" /></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Play className="w-8 h-8 text-white fill-white" /></div>
                    <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium line-clamp-1 drop-shadow">{reel.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="p-4 mt-0">
          <div className="max-w-md space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Account Info</h4>
              <div><div className="text-xs text-muted-foreground">Phone</div><div className="font-medium">{user.phone}</div></div>
              <div><div className="text-xs text-muted-foreground">Role</div><div className="font-medium capitalize">{user.role}</div></div>
              <div><div className="text-xs text-muted-foreground">Member since</div><div className="font-medium">{new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</div></div>
            </div>
            <Button variant="destructive" className="w-full" onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
