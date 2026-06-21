import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useListListings, useListReels, usePatchMyProfile, useUpdateUser, useGetUserProfile, useGetWishlist, useGetMyShop } from "@/lib/api";
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
import { Package, Settings, LogOut, Shield, Plus, Play, Edit3, Phone, CalendarClock, ClipboardList, Lock, Eye, EyeOff, Heart, Store, MapPin, Clock } from "lucide-react";
import MyBookings from "@/components/booking/MyBookings";
import { useProviderDashboard, useChangePassword } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

function SettingsTab({ user, logout, setLocation }) {
  const { toast } = useToast();
  const changePw = useChangePassword();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  function getStrength(pw) {
    if (!pw) return null;
    const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    if (score <= 1) return { label: "Kamzor", color: "bg-red-500", width: "25%" };
    if (score === 2) return { label: "Theek", color: "bg-yellow-500", width: "50%" };
    if (score === 3) return { label: "Achha", color: "bg-blue-500", width: "75%" };
    return { label: "Mazboot", color: "bg-green-500", width: "100%" };
  }

  const strength = getStrength(newPw);

  function handleChangePw(e) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast({ title: "Passwords match nahi ho rahe", variant: "destructive" }); return; }
    if (newPw.length < 6) { toast({ title: "Password kam se kam 6 characters ka hona chahiye", variant: "destructive" }); return; }
    changePw.mutate({ currentPassword: currentPw, newPassword: newPw }, {
      onSuccess: () => {
        toast({ title: "Password change ho gaya!" });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      },
      onError: (err) => toast({ title: err.message || "Password change failed", variant: "destructive" }),
    });
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="p-4 bg-muted/30 rounded-xl space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Account Info</h4>
        <div><div className="text-xs text-muted-foreground">Phone</div><div className="font-medium">{user.phone}</div></div>
        <div><div className="text-xs text-muted-foreground">Role</div><div className="font-medium capitalize">{user.role}</div></div>
        <div><div className="text-xs text-muted-foreground">Member since</div><div className="font-medium">{new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</div></div>
      </div>

      <form onSubmit={handleChangePw} className="p-4 bg-muted/30 rounded-xl space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4" /> Password Change Karein
        </h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Current Password</Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="••••••••"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              className="pr-9"
              required
            />
            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Naya Password</Label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              placeholder="Naya password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="pr-9"
              required
            />
            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {strength && (
            <div className="space-y-0.5">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <div className="text-xs text-muted-foreground">Strength: <span className="font-medium text-foreground">{strength.label}</span></div>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Password Confirm Karein</Label>
          <Input
            type="password"
            placeholder="Dobara likhein"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
          />
          {confirmPw && newPw !== confirmPw && <p className="text-xs text-red-500">Passwords match nahi ho rahe</p>}
        </div>
        <Button type="submit" className="w-full" size="sm" disabled={changePw.isPending || newPw !== confirmPw || !currentPw}>
          {changePw.isPending ? "Change ho raha hai..." : "Password Change Karein"}
        </Button>
      </form>

      <Button variant="destructive" className="w-full" onClick={() => { logout(); setLocation("/"); }}>
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}

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
  const { data: profile } = useGetUserProfile(user?.id, { enabled: !!user?.id });
  const { data: wishlistIds = [], isLoading: wishlistLoading } = useGetWishlist({ enabled: !!user });
  const { data: allListings = [], isLoading: allListingsLoading } = useListListings({}, { enabled: wishlistIds.length > 0 });
  const wishlistListings = allListings.filter((l) => wishlistIds.includes(l.id));
  const { data: myShop, isLoading: myShopLoading } = useGetMyShop({ enabled: !!user });
  const isProvider = user?.role === "provider" || user?.role === "admin" || user?.role === "super_admin";
  const { data: providerData } = useProviderDashboard({ enabled: isProvider, retry: false });

  const updateUser = useUpdateUser();
  const patchProfile = usePatchMyProfile();

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

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
        onError: () => toast({ title: "Update nahi ho saka", variant: "destructive" }),
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
            {providerData?.provider && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/provider"><ClipboardList className="w-3.5 h-3.5 mr-1" /> Provider</Link>
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
              <div className="font-bold">{profile?.followerCount ?? 0}</div>
              <div className="text-muted-foreground text-xs">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{profile?.followingCount ?? 0}</div>
              <div className="text-muted-foreground text-xs">Following</div>
            </div>
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
        <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0 justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="listings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm shrink-0">
            <Package className="w-4 h-4 mr-1.5" /> Listings
          </TabsTrigger>
          <TabsTrigger value="reels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm shrink-0">
            <Play className="w-4 h-4 mr-1.5" /> Reels
          </TabsTrigger>
          <TabsTrigger value="saved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm shrink-0">
            <Heart className="w-4 h-4 mr-1.5" /> Saved
          </TabsTrigger>
          <TabsTrigger value="myshop" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm shrink-0">
            <Store className="w-4 h-4 mr-1.5" /> My Shop
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm shrink-0">
            <CalendarClock className="w-4 h-4 mr-1.5" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm shrink-0">
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
              <p className="text-muted-foreground text-sm">Abhi koi listing nahi hai.</p>
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

        <TabsContent value="saved" className="p-4 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Saved Items</h3>
            <span className="text-xs text-muted-foreground">{wishlistIds.length} items</span>
          </div>
          {wishlistLoading || allListingsLoading ? (
            <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : !wishlistListings.length ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <Heart className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">Koi saved item nahi hai.</p>
              <Link href="/buy-sell"><Button variant="outline" size="sm" className="mt-3">Marketplace Dekhein</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wishlistListings.map((listing) => {
                let thumb = listing.photoUrl;
                try { const a = JSON.parse(thumb); thumb = Array.isArray(a) ? a[0] : thumb; } catch {}
                return (
                  <Link key={listing.id} href={`/buy-sell/${listing.id}`}>
                    <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-card">
                      <div className="h-32 bg-muted relative overflow-hidden">
                        {thumb ? <img src={thumb} alt={listing.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground/30" /></div>}
                        <div className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-black/70 rounded-full p-1">
                          <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold truncate">{listing.title}</p>
                        <p className="text-xs text-primary font-bold mt-0.5">₹{Number(listing.price).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="myshop" className="p-4 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">My Shop</h3>
            {!myShop && <Button size="sm" asChild><Link href="/user-shops/new"><Plus className="w-3.5 h-3.5 mr-1" /> Shop Banayein</Link></Button>}
          </div>
          {myShopLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded-xl" />
          ) : !myShop ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <Store className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm mb-3">Abhi aapki koi shop nahi hai.</p>
              <Button size="sm" asChild><Link href="/user-shops/new"><Plus className="w-3.5 h-3.5 mr-1" /> Shop Shuru Karein</Link></Button>
            </div>
          ) : (
            <Link href={`/user-shops/${myShop.id}`}>
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-card">
                <div className="h-36 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/20 relative">
                  {myShop.photoUrl ? <img src={myShop.photoUrl} alt={myShop.name} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-14 h-14 text-green-300" />
                    </div>
                  )}
                  {myShop.type && <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">{myShop.type}</div>}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-base">{myShop.name}</h4>
                    <Badge className="bg-green-100 text-green-700 shrink-0 text-xs">Active</Badge>
                  </div>
                  {myShop.description && <p className="text-sm text-muted-foreground line-clamp-2">{myShop.description}</p>}
                  <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                    {myShop.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {myShop.address}</span>}
                    {myShop.timing && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {myShop.timing}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                    <Link href={`/user-shops/${myShop.id}/edit`}>Edit Shop</Link>
                  </Button>
                </div>
              </div>
            </Link>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="p-4 mt-0">
          <div className="mb-4">
            <h3 className="font-semibold">My Bookings</h3>
            <p className="text-sm text-muted-foreground">Aapki rides, buses, aur events ki bookings.</p>
          </div>
          <MyBookings />
        </TabsContent>

        <TabsContent value="settings" className="p-4 mt-0">
          <SettingsTab user={user} logout={logout} setLocation={setLocation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
