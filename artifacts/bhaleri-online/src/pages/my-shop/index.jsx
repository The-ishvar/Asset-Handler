import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { useGetMyShop, useCreateMyShop, useUpdateMyShop, useAddShopItem, useDeleteShopItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Plus, Trash2, X, Images, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function parsePhotos(photos) {
  if (!photos) return [];
  try {
    const parsed = JSON.parse(photos);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return photos ? [photos] : [];
}

export default function MyShopPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: shop, isLoading } = useGetMyShop({ enabled: !!user });
  const createShop = useCreateMyShop();
  const updateShop = useUpdateMyShop();
  const addItem = useAddShopItem();
  const deleteItem = useDeleteShopItem();

  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [editingShop, setEditingShop] = useState(false);

  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPhotos, setItemPhotos] = useState([""]);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const handleCreateShop = (e) => {
    e.preventDefault();
    createShop.mutate({ name: shopName, description: shopDesc }, {
      onSuccess: () => { toast({ title: "Shop created!" }); qc.invalidateQueries({ queryKey: ["myShop"] }); },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleUpdateShop = (e) => {
    e.preventDefault();
    updateShop.mutate({ name: shopName || shop.name, description: shopDesc || shop.description }, {
      onSuccess: () => { toast({ title: "Shop updated!" }); setEditingShop(false); qc.invalidateQueries({ queryKey: ["myShop"] }); },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const validPhotos = itemPhotos.filter(p => p.trim());
    const photos = validPhotos.length === 0 ? null : validPhotos.length === 1 ? validPhotos[0] : JSON.stringify(validPhotos);
    addItem.mutate({ title: itemTitle, description: itemDesc || null, price: Number(itemPrice), photos }, {
      onSuccess: () => {
        toast({ title: "Item added!" });
        setItemTitle(""); setItemDesc(""); setItemPrice(""); setItemPhotos([""]);
        setShowAddItem(false);
        qc.invalidateQueries({ queryKey: ["myShop"] });
      },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleDeleteItem = (itemId) => {
    deleteItem.mutate(itemId, {
      onSuccess: () => { toast({ title: "Item remove ho gaya" }); qc.invalidateQueries({ queryKey: ["myShop"] }); },
    });
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );

  if (!shop) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="text-center mb-8">
          <Store className="w-16 h-16 text-purple-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Create Your Shop</h1>
          <p className="text-muted-foreground mt-1">Set up your personal shop to sell items to the Bhaleri community</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div className="space-y-2">
                <Label>Shop Name *</Label>
                <Input placeholder="e.g. Ramesh General Store" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="What do you sell? Tell customers about your shop..." value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} rows={3} />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={createShop.isPending}>
                {createShop.isPending ? "Creating..." : "Create Shop"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full text-purple-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            {shop.description && <p className="text-muted-foreground text-sm">{shop.description}</p>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setShopName(shop.name); setShopDesc(shop.description || ""); setEditingShop(true); }}>
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>
      </div>

      {editingShop && (
        <Card>
          <CardHeader><CardTitle className="text-base">Edit Shop</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateShop} className="space-y-3">
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop name" />
              <Textarea value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} placeholder="Description" rows={2} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingShop(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={updateShop.isPending}>Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Items ({shop.items?.length || 0})</h2>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddItem(!showAddItem)}>
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {showAddItem && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add New Item</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Item Name *</Label>
                <Input placeholder="e.g. Fresh Mangoes" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹) *</Label>
                <Input type="number" min="0" placeholder="100" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Describe your item..." value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5"><Images className="w-3.5 h-3.5" /> Photos (1-3)</Label>
                  {itemPhotos.length < 3 && (
                    <button type="button" onClick={() => setItemPhotos([...itemPhotos, ""])} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add photo
                    </button>
                  )}
                </div>
                {itemPhotos.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input type="url" placeholder={`Photo ${i + 1} URL`} value={url} onChange={(e) => { const p = [...itemPhotos]; p[i] = e.target.value; setItemPhotos(p); }} />
                    {itemPhotos.length > 1 && (
                      <button type="button" onClick={() => setItemPhotos(itemPhotos.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowAddItem(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={addItem.isPending}>
                  {addItem.isPending ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!shop.items?.length ? (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
          <Store className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-muted-foreground">No items yet. Add your first item above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shop.items.map((item) => {
            const photos = parsePhotos(item.photos);
            return (
              <div key={item.id} className="border rounded-xl overflow-hidden bg-card">
                <div className="h-40 bg-muted flex items-center justify-center">
                  {photos[0]
                    ? <img src={photos[0]} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    : <Store className="w-10 h-10 text-muted-foreground/30" />}
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight">{item.title}</p>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-purple-700 dark:text-purple-400 font-bold">₹{Number(item.price).toLocaleString("en-IN")}</p>
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
