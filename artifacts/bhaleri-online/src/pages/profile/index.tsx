import { useAuth } from "@/lib/auth";
import { useListListings, useUpdateUser, ListingStatus } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Settings, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, logout, login, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  const { data: myListings, isLoading: listingsLoading } = useListListings(
    { userId: user?.id },
    { query: { enabled: !!user?.id } }
  );

  const updateUserMutation = useUpdateUser();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(
      { id: user.id, data: { name, phone } },
      {
        onSuccess: (updatedUser) => {
          if (token) login(token, updatedUser);
          setIsEditing(false);
          toast({ title: "Profile updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'pending': 
      default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-1/3">
          <CardContent className="pt-6 text-center space-y-4">
            <Avatar className="w-32 h-32 mx-auto border-4 border-primary/10">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              {user.role === 'admin' && (
                <Badge className="mt-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </Badge>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              {user.role === 'admin' && (
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => {
                logout();
                setLocation("/");
              }}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <Tabs defaultValue="listings" className="w-full">
            <CardHeader className="pb-0 border-b">
              <TabsList className="bg-transparent border-b-0 justify-start h-auto p-0">
                <TabsTrigger 
                  value="listings" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-4"
                >
                  <Package className="w-4 h-4 mr-2" /> My Listings
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-4"
                >
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="listings" className="mt-0 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Items you're selling</h3>
                  <Button size="sm" asChild>
                    <Link href="/buy-sell/new">Post New Item</Link>
                  </Button>
                </div>
                
                {listingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
                  </div>
                ) : !myListings?.length ? (
                  <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground mb-4">You haven't posted any items yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myListings.map(listing => (
                      <div key={listing.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/10 transition-colors">
                        <div className="w-20 h-20 bg-muted rounded-md overflow-hidden shrink-0">
                          {listing.photoUrl ? (
                            <img src={listing.photoUrl} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="w-8 h-8 opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold truncate pr-2">{listing.title}</h4>
                            {getStatusBadge(listing.status)}
                          </div>
                          <div className="text-primary font-bold mt-1">₹{listing.price}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Posted on {new Date(listing.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user.email} 
                      disabled 
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-2">
                    {isEditing ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsEditing(false);
                          setName(user.name);
                          setPhone(user.phone || "");
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateUserMutation.isPending}>
                          {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
