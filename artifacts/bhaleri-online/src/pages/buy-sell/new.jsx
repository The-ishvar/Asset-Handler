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
import { ShoppingBag } from "lucide-react";

export default function NewListing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contactInfo, setContactInfo] = useState(user?.phone || "");
  const [photoUrl, setPhotoUrl] = useState("");

  if (!user) { setLocation("/login"); return null; }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !contactInfo) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createListing.mutate(
      { title, description: description || null, price: Number(price), contactInfo, photoUrl: photoUrl || null },
      {
        onSuccess: () => {
          toast({ title: "Listing submitted", description: "Your listing will be visible once approved by an admin." });
          setLocation("/buy-sell");
        },
        onError: (err) => toast({ title: "Failed to submit listing", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><ShoppingBag className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Post an Item</h1>
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
            <div className="space-y-2">
              <Label>Photo URL (Optional)</Label>
              <Input type="url" placeholder="https://example.com/photo.jpg" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
              {photoUrl && <img src={photoUrl} alt="Preview" className="h-32 w-full object-contain rounded-lg border bg-muted" onError={(e) => { e.target.style.display = "none"; }} />}
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
