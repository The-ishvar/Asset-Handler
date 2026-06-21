import { useState } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetListing, useAddToCart, useGetCart, useSendMessage,
  useGetWishlist, useToggleWishlist, useGetListingReviews, useCreateReview, useUpdateListing
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Phone, ShoppingBag, User, Calendar, MessageCircle,
  ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart,
  Heart, MapPin, Star, Truck, Package, Tag, CheckCircle2,
  ToggleLeft, ToggleRight
} from "lucide-react";

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
      <div className="h-[280px] sm:h-[400px] rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center border border-purple-100">
        <ShoppingBag className="w-20 h-20 text-purple-200 dark:text-purple-800" />
      </div>
    );
  }
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div className="space-y-3">
      <div className="relative h-[280px] sm:h-[400px] rounded-2xl overflow-hidden bg-black/5 border border-border group shadow">
        <img src={photos[current]} alt={`${title} - photo ${current + 1}`}
          className="w-full h-full object-contain"
          onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }} />
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"}`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{current + 1}/{photos.length}</div>
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === current ? "border-purple-500 shadow scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = "none"; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <Star className={`w-6 h-6 ${s <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="border rounded-xl p-4 space-y-2 bg-card">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
          {review.userAvatar
            ? <img src={review.userAvatar} className="w-full h-full rounded-full object-cover" />
            : <User className="w-3.5 h-3.5 text-purple-500" />}
        </div>
        <div>
          <div className="text-xs font-semibold">{review.userName || "User"}</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
            ))}
          </div>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-IN")}</span>
      </div>
      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
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
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: listing, isLoading, error } = useGetListing(id, { enabled: !!id });
  const { data: cartItems = [] } = useGetCart({ enabled: !!user });
  const { data: wishlistIds = [] } = useGetWishlist({ enabled: !!user });
  const { data: reviews = [] } = useGetListingReviews(id, { enabled: !!id });
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const createReview = useCreateReview();
  const updateListing = useUpdateListing();
  const sendMsg = useSendMessage();

  const isInCart = cartItems.some((i) => i.listingId === id);
  const isOwnListing = user && listing && listing.userId === user.id;
  const isWishlisted = wishlistIds.includes(id);

  const price = listing?.price || 0;
  const mrp = listing?.discountPrice;
  const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  const handleBuyNow = () => {
    if (!user) { setLocation("/login"); return; }
    sendMsg.mutate(
      { receiverId: listing.userId, content: `Hi! I'm interested in buying "${listing.title}" listed at ₹${Number(listing.price).toLocaleString("en-IN")}. Is it still available?` },
      {
        onSuccess: () => { toast({ title: "Message sent to seller!" }); setLocation(`/messages/${listing.userId}`); },
        onError: () => toast({ title: "Message nahi bheja ja saka", variant: "destructive" }),
      }
    );
  };

  const handleAddToCart = () => {
    if (!user) { setLocation("/login"); return; }
    if (isInCart) { setLocation("/cart"); return; }
    addToCart.mutate({ listingId: id }, {
      onSuccess: () => toast({ title: "Added to cart!" }),
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleWishlist = () => {
    if (!user) { setLocation("/login"); return; }
    toggleWishlist.mutate({ listingId: id }, {
      onError: () => toast({ title: "Kuch gadbad ho gayi", variant: "destructive" }),
    });
  };

  const handleToggleSoldOut = () => {
    updateListing.mutate({ id, data: { isSoldOut: !listing.isSoldOut } }, {
      onSuccess: () => {
        toast({ title: listing.isSoldOut ? "Marked as available" : "Marked as sold out" });
        qc.invalidateQueries({ queryKey: ["getListing", id] });
        qc.invalidateQueries({ queryKey: ["listListings"] });
      },
    });
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!user) { setLocation("/login"); return; }
    if (!reviewRating) { toast({ title: "Rating zaroor chunein", variant: "destructive" }); return; }
    createReview.mutate(
      { listingId: id, rating: reviewRating, comment: reviewComment || null },
      {
        onSuccess: () => {
          toast({ title: "Review submitted!" });
          setReviewRating(0);
          setReviewComment("");
          qc.invalidateQueries({ queryKey: ["listingReviews", id] });
          qc.invalidateQueries({ queryKey: ["getListing", id] });
        },
        onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-[360px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-32 w-full" /></div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-destructive mb-4">Listing not found.</p>
        <Link href="/buy-sell"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace</Button></Link>
      </div>
    );
  }

  const photos = parsePhotos(listing.photoUrl);
  const avgRating = listing.avgRating || 0;
  const reviewCount = listing.reviewCount || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link href="/buy-sell">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Marketplace
        </button>
      </Link>

      <PhotoGallery photos={photos} title={listing.title} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: main info */}
        <div className="md:col-span-2 space-y-5">
          {/* Price & title */}
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                ₹{Number(price).toLocaleString("en-IN")}
              </div>
              {mrp && mrp > price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{Number(mrp).toLocaleString("en-IN")}</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">{discount}% OFF</Badge>
                </>
              )}
              {listing.isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{listing.title}</h1>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {listing.category && listing.category !== "Others" && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-900">
                  <Tag className="w-3 h-3" /> {listing.category}
                </span>
              )}
              {listing.location && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                  <MapPin className="w-3 h-3" /> {listing.location}
                </span>
              )}
              {listing.deliveryAvailable && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-100 dark:border-green-900">
                  <Truck className="w-3 h-3" /> Delivery Available
                </span>
              )}
              {listing.quantity > 1 && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900">
                  <Package className="w-3 h-3" /> {listing.quantity} in stock
                </span>
              )}
            </div>

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{avgRating}</span>
                <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
              </div>
            )}
          </div>

          {/* CTA buttons */}
          {!isOwnListing && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2 h-11" onClick={handleBuyNow} disabled={listing.isSoldOut || sendMsg.isPending}>
                  <MessageCircle className="w-4 h-4" />
                  {sendMsg.isPending ? "Bhej raha hai…" : "Chat with Seller"}
                </Button>
                <Button variant="outline" size="icon" className={`h-11 w-11 shrink-0 ${isWishlisted ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}`} onClick={handleWishlist}>
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
              <Button
                variant={isInCart ? "default" : "outline"}
                className={`w-full gap-2 h-11 ${isInCart ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                onClick={handleAddToCart}
                disabled={listing.isSoldOut || addToCart.isPending}
              >
                <ShoppingCart className="w-4 h-4" />
                {listing.isSoldOut ? "Sold Out" : isInCart ? "View Cart" : addToCart.isPending ? "Adding…" : "Add to Cart"}
              </Button>
            </div>
          )}

          {/* Owner controls */}
          {isOwnListing && (
            <div className="flex gap-3 items-center p-3 border rounded-xl bg-muted/30">
              <span className="text-sm text-muted-foreground flex-1">Your listing</span>
              <Button size="sm" variant="outline" onClick={handleToggleSoldOut} disabled={updateListing.isPending} className="gap-1.5">
                {listing.isSoldOut ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <ToggleRight className="w-3.5 h-3.5 text-muted-foreground" />}
                {listing.isSoldOut ? "Mark Available" : "Mark Sold Out"}
              </Button>
            </div>
          )}

          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold mb-2 border-b pb-2">Description</h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
              {listing.description || "No detailed description provided."}
            </div>
          </section>

          {/* Reviews */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold">Reviews & Ratings</h2>
              <span className="text-sm text-muted-foreground">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</span>
            </div>

            {user && !isOwnListing && (
              <form onSubmit={handleReview} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                <h3 className="text-sm font-semibold">Write a Review</h3>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Your rating</p>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                </div>
                <Textarea placeholder="Share your experience with this product or seller…" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={2} className="text-sm" />
                <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700" disabled={createReview.isPending}>
                  {createReview.isPending ? "Submitting…" : "Submit Review"}
                </Button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
              </div>
            )}
          </section>
        </div>

        {/* Right: seller card */}
        <div className="space-y-4">
          <Card className="border-t-4 border-t-purple-500 shadow-sm sticky top-4">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold border-b pb-2">Seller Info</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 overflow-hidden">
                  {listing.userAvatar
                    ? <img src={listing.userAvatar} className="w-full h-full object-cover" />
                    : <User className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Posted by</div>
                  <div className="font-semibold text-sm">{listing.userName || "Resident"}</div>
                </div>
              </div>
              {listing.contactInfo && (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full text-green-600"><Phone className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Contact</div>
                    <a href={`tel:${listing.contactInfo}`} className="font-medium text-sm text-primary hover:underline">{listing.contactInfo}</a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600"><Calendar className="w-4 h-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Listed on</div>
                  <div className="font-medium text-sm">{new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              </div>
              {user && !isOwnListing && (
                <Link href={`/messages/${listing.userId}`}>
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <MessageCircle className="w-3.5 h-3.5" /> Message Seller
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
