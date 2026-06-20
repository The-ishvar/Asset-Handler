import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetListing, useAddToCart, useGetCart, useSendMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, ShoppingBag, User, Calendar, MessageCircle, ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

function parsePhotos(photoUrl) {
  if (!photoUrl) return [];
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return [photoUrl];
}

function PhotoGallery({ photos, title }) {
  const [current, setCurrent] = useState(0);
  if (!photos.length) {
    return (
      <div className="h-[300px] md:h-[440px] rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center border border-purple-100">
        <ShoppingBag className="w-24 h-24 text-purple-200 dark:text-purple-800" />
      </div>
    );
  }
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div className="space-y-3">
      <div className="relative h-[300px] md:h-[440px] rounded-2xl overflow-hidden bg-black/5 border border-border group shadow-lg">
        <img
          src={photos[current]}
          alt={`${title} - photo ${current + 1}`}
          className="w-full h-full object-contain"
          onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }}
        />
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"}`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {photos.length}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === current ? "border-purple-500 shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100 hover:border-purple-300"}`}
            >
              <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = "none"; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingDetail() {
  const [, params] = useRoute("/buy-sell/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: listing, isLoading, error } = useGetListing(id, { enabled: !!id });
  const { data: cartItems } = useGetCart({ enabled: !!user });
  const addToCart = useAddToCart();
  const sendMsg = useSendMessage();

  const isInCart = cartItems?.some((i) => i.listingId === id);
  const isOwnListing = user && listing && listing.userId === user.id;

  const handleBuyNow = () => {
    if (!user) { setLocation("/login"); return; }
    // Send a message to seller expressing interest
    sendMsg.mutate(
      { receiverId: listing.userId, content: `Hi! I'm interested in buying "${listing.title}" listed at ₹${Number(listing.price).toLocaleString("en-IN")}. Is it still available?` },
      {
        onSuccess: () => {
          toast({ title: "Request sent to seller!", description: "Opening chat with seller..." });
          setLocation(`/messages/${listing.userId}`);
        },
        onError: () => toast({ title: "Could not send message", variant: "destructive" }),
      }
    );
  };

  const handleAddToCart = () => {
    if (!user) { setLocation("/login"); return; }
    if (isInCart) { setLocation("/cart"); return; }
    addToCart.mutate(id, {
      onSuccess: () => toast({ title: "Added to cart!", description: "View your cart to see all saved items." }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-[440px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-32 w-full" /></div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !listing) return (
    <div className="text-center py-20">
      <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-destructive">Listing not found.</p>
      <Link href="/buy-sell"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to listings</Button></Link>
    </div>
  );

  const photos = parsePhotos(listing.photoUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/buy-sell">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Buy & Sell
        </button>
      </Link>

      <PhotoGallery photos={photos} title={listing.title} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">₹{Number(listing.price).toLocaleString("en-IN")}</div>
              {listing.status === "approved" && <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{listing.title}</h1>
          </div>

          {!isOwnListing && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleBuyNow}
                disabled={sendMsg.isPending}
              >
                <Zap className="w-4 h-4 mr-2" />
                {sendMsg.isPending ? "Sending..." : "Buy Now"}
              </Button>
              <Button
                variant={isInCart ? "default" : "outline"}
                className={isInCart ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1"}
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isInCart ? "View Cart" : addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          <section>
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Description</h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {listing.description || "No detailed description provided."}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-purple-500 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-lg border-b pb-2">Seller Info</h3>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-full text-purple-600"><User className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Posted by</div>
                  <div className="font-medium">{listing.userName || "Resident"}</div>
                </div>
              </div>
              {listing.contactInfo && (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full text-green-600"><Phone className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Contact</div>
                    <a href={`tel:${listing.contactInfo}`} className="font-medium text-primary hover:underline">{listing.contactInfo}</a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600"><Calendar className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Listed on</div>
                  <div className="font-medium">{new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>
              {user && !isOwnListing && (
                <Link href={`/messages/${listing.userId}`}>
                  <Button variant="outline" className="w-full"><MessageCircle className="w-4 h-4 mr-2" /> Message Seller</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
