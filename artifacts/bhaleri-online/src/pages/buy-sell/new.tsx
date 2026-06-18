import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateListing } from "@workspace/api-client-react";
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

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !price || !contactInfo) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    createListing.mutate(
      { 
        data: { 
          title, 
          description: description || null, 
          price: Number(price), 
          contactInfo,
          photoUrl: photoUrl || null
        } 
      },
      {
        onSuccess: () => {
          toast({ 
            title: "Listing submitted", 
            description: "Your listing will be visible once approved by an admin." 
          });
          setLocation("/buy-sell");
        },
        onError: (err) => {
          toast({ 
            title: "Failed to submit listing", 
            description: err.message,
            variant: "destructive" 
          });
        }
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Post an Item</h1>
          <p className="text-muted-foreground">Sell your items to the Bhaleri community</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>All listings require admin approval before appearing on the site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Item Name / Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                placeholder="e.g. Hero Honda Splendor, Samsung Smartphone" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
              <Input 
                id="price" 
                type="number"
                min="0"
                placeholder="0" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the condition, age, and features of the item..." 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Number <span className="text-red-500">*</span></Label>
              <Input 
                id="contactInfo" 
                placeholder="Your phone number" 
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
              <Input 
                id="photoUrl" 
                type="url"
                placeholder="https://example.com/image.jpg" 
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Provide a link to an image of your item.</p>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation("/buy-sell")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={createListing.isPending}>
                {createListing.isPending ? "Submitting..." : "Submit Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
