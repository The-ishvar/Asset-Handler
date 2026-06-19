import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateListing } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Plus, X, Images } from "lucide-react";

export default function NewListing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contactInfo, setContactInfo] = useState(user?.phone || "");
  const [photos, setPhotos] = useState([""]);

  if (!user) { setLocation("/login"); return null; }

  const addPhoto = () => { if (photos.length < 4) setPhotos([...photos, ""]); };
  const removePhoto = (i) => setPhotos(photos.filter((_, idx) => idx !== i));
  const updatePhoto = (i, val) => { const p = [...photos]; p[i] = val; setPhotos(p); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !contactInfo) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    const validPhotos = photos.filter((p) => p.trim());
    const photoUrl = validPhotos.length === 0 ? null
      : validPhotos.length === 1 ? validPhotos[0]
      : JSON.stringify(validPhotos);

    createListing.mutate(
      { title, description: description || null, price: Number(price), contactInfo, photoUrl },
      {
        onSuccess: () => {
          toast({ title: "Listing submitted!", description: "Your listing will be visible once approved by an admin." });
          setLocation("/buy-sell");
        },
        onError: (err) => toast({ title: "Failed to submit listing", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full"><ShoppingBag className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-bold">Post an Item</h1>
          <p className="text-muted-foreground">Sell your items to the Bhaleri community</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Fill in the details below. Your listing will be reviewed by an admin before going live.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Item Title *</Label>
              <Input placeholder="e.g. Samsung TV 32 inch" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input type="number" min="0" placeholder="5000" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe your item — condition, age, reason for selling..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>

            {/* Multi-photo section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2"><Images className="w-4 h-4 text-purple-500" /> Photos <span className="text-muted-foreground font-normal">(up to 4)</span></Label>
                {photos.length < 4 && (
                  <button type="button" onClick={addPhoto} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add photo
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {photos.map((url, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder={`Photo ${i + 1} URL — https://example.com/photo.jpg`}
                        value={url}
                        onChange={(e) => updatePhoto(i, e.target.value)}
                      />
                      {photos.length > 1 && (
                        <button type="button" onClick={() => removePhoto(i)} className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-muted transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {url && (
                      <img src={url} alt={`Preview ${i + 1}`} className="h-24 w-full object-contain rounded-lg border bg-muted"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Buyers will see all photos in a gallery when they open your listing.</p>
            </div>

            <div className="space-y-2">
              <Label>Contact Info *</Label>
              <Input placeholder="Phone number" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/buy-sell")}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={createListing.isPending}>
                {createListing.isPending ? "Submitting..." : "Submit Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
