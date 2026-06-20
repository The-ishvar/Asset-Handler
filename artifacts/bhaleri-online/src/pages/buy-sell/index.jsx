import { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useListListings, useGetCart, useAddToCart, useGetWishlist, useToggleWishlist } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useFeatures } from "@/lib/features";
import {
  ShoppingBag, PlusCircle, Search, SlidersHorizontal, X,
  Heart, MapPin, Star, ShoppingCart, Filter, Store, ArrowRight
} from "lucide-react";
import AdsSection from "@/components/ads-section";

const CATEGORIES = ["All", "Fashion", "Electronics", "Grocery", "Medical", "Home & Kitchen", "Farming", "Vehicles", "Services", "Others"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
  { label: "Popular", value: "popular" },
];

function parseFirstPhoto(photoUrl) {
  if (!photoUrl) return null;
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {}
  return photoUrl;
}

function StarRow({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">({count})</span>
    </div>
  );
}

function ProductCard({ listing, isWishlisted, onWishlist, inCart, onAddToCart }) {
  const photo = parseFirstPhoto(listing.photoUrl);
  const price = listing.price;
  const mrp = listing.discountPrice;
  const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  return (
    <Link href={`/buy-sell/${listing.id}`}>
      <div className="rounded-xl overflow-hidden border bg-card hover:shadow-md transition-all duration-200 group h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-purple-50 dark:bg-purple-950/20 overflow-hidden shrink-0">
          {photo ? (
            <img src={photo} alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-purple-200 dark:text-purple-800" />
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
              {discount}% OFF
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(); }}
            className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 rounded-full p-1.5 shadow-sm transition-colors"
          >
            <Heart className={`w-3 h-3 ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>

          {listing.isSoldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-foreground text-[10px] font-bold px-2 py-0.5 rounded">SOLD OUT</span>
            </div>
          )}

          {listing.deliveryAvailable && !listing.isSoldOut && (
            <div className="absolute bottom-1.5 left-1.5 bg-blue-500/90 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-sm">
              🚚 Delivery
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-2.5 flex flex-col flex-1 gap-1">
          <h3 className="text-xs font-semibold line-clamp-2 leading-snug text-foreground">{listing.title}</h3>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-purple-700 dark:text-purple-400">₹{price.toLocaleString("en-IN")}</span>
            {mrp && mrp > price && (
              <span className="text-[10px] text-muted-foreground line-through">₹{Number(mrp).toLocaleString("en-IN")}</span>
            )}
          </div>

          <StarRow rating={listing.avgRating || 0} count={listing.reviewCount || 0} />

          {listing.location && (
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground truncate">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
          )}

          {listing.userName && (
            <div className="text-[10px] text-muted-foreground truncate">by {listing.userName}</div>
          )}

          <div className="mt-auto pt-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(); }}
              disabled={listing.isSoldOut}
              className={`w-full text-[11px] font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                listing.isSoldOut
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : inCart
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              <ShoppingCart className="w-3 h-3" />
              {listing.isSoldOut ? "Sold Out" : inCart ? "In Cart ✓" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BuySellList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings = [], isLoading } = useListListings({ status: "approved" });
  const { data: cartItems = [] } = useGetCart({ enabled: !!user });
  const { data: wishlistIds = [] } = useGetWishlist({ enabled: !!user });
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();

  const cartListingIds = new Set(cartItems.map((i) => i.listingId));
  const wishSet = new Set(wishlistIds);

  const filtered = useMemo(() => {
    let result = [...listings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        (l.description?.toLowerCase().includes(q)) ||
        (l.location?.toLowerCase().includes(q))
      );
    }
    if (activeCategory !== "All") {
      result = result.filter((l) => l.category === activeCategory);
    }
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null) result = result.filter((l) => l.price >= min);
    if (max !== null) result = result.filter((l) => l.price <= max);

    switch (sortBy) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "popular": result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [listings, searchQuery, activeCategory, sortBy, minPrice, maxPrice]);

  const handleAddToCart = useCallback((listingId) => {
    if (!user) { setLocation("/login"); return; }
    if (cartListingIds.has(listingId)) { setLocation("/cart"); return; }
    addToCart.mutate({ listingId }, {
      onSuccess: () => toast({ title: "Added to cart!" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }, [user, cartListingIds, addToCart, toast, setLocation]);

  const handleWishlist = useCallback((listingId) => {
    if (!user) { setLocation("/login"); return; }
    toggleWishlist.mutate({ listingId }, {
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }, [user, toggleWishlist, toast, setLocation]);

  const hasFilters = minPrice || maxPrice || sortBy !== "newest";
  const clearFilters = () => { setMinPrice(""); setMaxPrice(""); setSortBy("newest"); };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Marketplace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Buy & Sell in Bhaleri</p>
        </div>
        <Link href="/buy-sell/new">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Sell Item</span>
          </Button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search products, sellers, locations…" className="pl-9 h-9 text-sm"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters((v) => !v)} className="shrink-0 gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
          {hasFilters && <span className="bg-white text-purple-700 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">!</span>}
        </Button>
      </div>

      {/* Category tabs */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max pb-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-border text-foreground/70 hover:border-purple-400 hover:text-purple-600 bg-background"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-muted/40 border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Sort & Filter</h3>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-destructive hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Sort By</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => setSortBy(o.value)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${sortBy === o.value ? "bg-purple-600 text-white border-purple-600" : "border-border hover:border-purple-400"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Min Price (₹)</p>
              <Input type="number" min="0" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Max Price (₹)</p>
              <Input type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Browse Shops Banner */}
      <Link href="/user-shops">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Browse Local Shops</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Explore shops from Bhaleri sellers</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-600 shrink-0" />
        </div>
      </Link>

      <AdsSection max={2} title="Sponsored" />

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"} found
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        </p>
      )}

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border bg-card">
              <Skeleton className="aspect-square w-full" />
              <div className="p-2.5 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different category or search term</p>
          {(hasFilters || activeCategory !== "All" || searchQuery) && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => { clearFilters(); setActiveCategory("All"); setSearchQuery(""); }}>
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              isWishlisted={wishSet.has(listing.id)}
              onWishlist={() => handleWishlist(listing.id)}
              inCart={cartListingIds.has(listing.id)}
              onAddToCart={() => handleAddToCart(listing.id)}
            />
          ))}
        </div>
      )}

      {/* Floating sell button on mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Link href="/buy-sell/new">
          <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg p-3.5 flex items-center justify-center transition-colors">
            <PlusCircle className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
