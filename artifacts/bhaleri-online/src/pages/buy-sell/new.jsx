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
import { ShoppingBag, MapPin, Package, Truck } from "lucide-react";
import ImageUpload from "@/components/marketplace/ImageUpload";

const CATEGORIES = ["Fashion", "Electronics", "Grocery", "Medical", "Home & Kitchen", "Farming", "Vehicles", "Services", "Others"];

export default function NewListing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Others");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation_] = useState("");
  const [contactInfo, setContactInfo] = useState(user?.phone || "");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [photos, setPhotos] = useState([]);

  if (!user) { setLocation("/login"); return null; }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !contactInfo) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    if (discountPrice && Number(discountPrice) <= Number(price)) {
      toast({ title: "Original price must be higher than selling price", variant: "destructive" }); return;
    }

    const photoUrl = photos.length === 0 ? null
      : photos.length === 1 ? photos[0]
      : JSON.stringify(photos);

    createListing.mutate(
      {
        title,
        description: description || null,
        photoUrl,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        contactInfo,
        category,
        location: location || null,
        quantity: parseInt(quantity) || 1,
        deliveryAvailable,
      },
      {
        onSuccess: () => {
          toast({ title: "Listing posted!", description: "Your product is now live on the marketplace." });
          setLocation("/buy-sell");
        },
        onError: (err) => toast({ title: "Failed to post listing", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sell an Item</h1>
          <p className="text-muted-foreground text-sm">List your product on the Bhaleri Marketplace</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Product Photos</CardTitle>
            <CardDescription className="text-xs">Good photos get 3× more buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={photos} onChange={setPhotos} max={4} />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product Title <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Samsung TV 32 inch — good condition" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label>Category <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      category === cat
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-border hover:border-purple-400 text-foreground/70"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe your item — condition, age, features, reason for selling…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Selling Price (₹) <span className="text-red-500">*</span></Label>
                <Input type="number" min="0" placeholder="500" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price / MRP (₹)</Label>
                <Input type="number" min="0" placeholder="800 (optional)" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Shows crossed-out original price</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Available Quantity</Label>
              <Input type="number" min="1" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Location & Delivery */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Location & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location / Area</Label>
              <Input placeholder="e.g. Bhaleri Main Road, Ward 3" value={location} onChange={(e) => setLocation_(e.target.value)} />
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-500" /> Delivery Available</div>
                <p className="text-xs text-muted-foreground mt-0.5">Can you deliver to the buyer?</p>
              </div>
              <button type="button" onClick={() => setDeliveryAvailable((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${deliveryAvailable ? "bg-purple-600" : "bg-muted"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${deliveryAvailable ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Phone Number <span className="text-red-500">*</span></Label>
              <Input placeholder="Your mobile number" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/buy-sell")}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={createListing.isPending}>
            {createListing.isPending ? "Posting…" : "🚀 Post Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
