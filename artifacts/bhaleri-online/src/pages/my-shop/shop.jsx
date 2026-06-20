import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useGetUserShop as useGetShop } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Store, ArrowLeft, MessageCircle, Search, Star,
  MapPin, Phone, Package, Truck, ShoppingCart, Zap,
  CheckCircle, Clock, Filter, X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const DEMO_REVIEWS = [
  { id: 1, name: "Rahul Sharma", rating: 5, text: "Excellent products, very fresh!", avatar: null, date: "2 days ago" },
  { id: 2, name: "Priya Devi", rating: 4, text: "Good quality items, fast response from seller.", avatar: null, date: "1 week ago" },
  { id: 3, name: "Amit Kumar", rating: 5, text: "Best shop in Bhaleri! Highly recommended.", avatar: null, date: "2 weeks ago" },
];

function parsePhotos(photos) {
  if (!photos) return [];
  try {
    const parsed = JSON.parse(photos);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return photos ? [photos] : [];
}

function StarRow({ rating = 0, count, size = "sm" }) {
  const cls = size === "lg" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`${cls} ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}

function ProductCard({ item, shopOwnerName, shopOwnerId, user }) {
  const photos = parsePhotos(item.photos);
  const { toast } = useToast();
  const price = Number(item.price);
  const mrp = item.mrp ? Number(item.mrp) : null;
  const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const inStock = item.stock === undefined || item.stock > 0;

  return (
    <div className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {photos[0] ? (
          <img src={photos[0]} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <Store className="w-10 h-10 text-muted-foreground/30" />
        )}
        {discount > 0 && (
          <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
            {discount}% OFF
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-foreground text-[10px] font-bold px-2 py-0.5 rounded">OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="font-semibold text-sm line-clamp-2 leading-snug">{item.title}</p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold text-purple-700 dark:text-purple-400">₹{price.toLocaleString("en-IN")}</span>
          {mrp && mrp > price && (
            <span className="text-xs text-muted-foreground line-through">₹{mrp.toLocaleString("en-IN")}</span>
          )}
        </div>
        {item.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>}
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          {user && shopOwnerId && user.id !== shopOwnerId && (
            <>
              <button
                disabled={!inStock}
                onClick={() => toast({ title: "Added to cart!", description: item.title })}
                className={`w-full text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  !inStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                <ShoppingCart className="w-3 h-3" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <Link href={`/messages/${shopOwnerId}`}>
                <button className="w-full text-xs font-semibold py-1.5 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Contact Seller
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopView() {
  const [, params] = useRoute("/shop/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { data: shop, isLoading, error } = useGetShop(id, { enabled: !!id });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const demoRating = 4.5;
  const demoReviewCount = 23;

  const filteredItems = useMemo(() => {
    if (!shop?.items) return [];
    const q = search.toLowerCase();
    return shop.items.filter(item =>
      !q || item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
    );
  }, [shop?.items, search]);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  );

  if (error || !shop) return (
    <div className="text-center py-20">
      <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-destructive font-medium">Shop not found.</p>
      <Link href="/user-shops"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Shops</Button></Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <Link href="/user-shops">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> All Shops
        </button>
      </Link>

      {/* Shop Header Card */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-purple-600 to-purple-400 flex items-center px-5 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-lg shrink-0">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white line-clamp-1">{shop.name}</h1>
            {shop.description && <p className="text-sm text-purple-100 line-clamp-1 mt-0.5">{shop.description}</p>}
          </div>
          <div className="shrink-0">
            <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Open
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={shop.ownerAvatar || ""} />
                <AvatarFallback className="text-sm">{(shop.ownerName || "?").charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="text-sm font-semibold">{shop.ownerName || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <StarRow rating={demoRating} count={demoReviewCount} size="lg" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="w-4 h-4 text-purple-500" />
              <span>{shop.items?.length || 0} products</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              <span>Delivery Available</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-green-500" />
              <span>Responds within 1 hour</span>
            </div>
          </div>

          {user && shop.userId !== user.id && (
            <Link href={`/messages/${shop.userId}`}>
              <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto gap-2">
                <MessageCircle className="w-4 h-4" /> Chat with Shop Owner
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-4">
        {["products", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "products" ? `Products (${shop.items?.length || 0})` : `Reviews (${demoReviewCount})`}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div className="space-y-4">
          {shop.items && shop.items.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products…"
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {!shop.items?.length ? (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground">No products listed yet.</p>
              {user && shop.userId === user.id && (
                <Link href="/my-shop">
                  <Button size="sm" variant="outline" className="mt-3">Add Products</Button>
                </Link>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No products match your search.</p>
              <button onClick={() => setSearch("")} className="text-xs text-purple-600 underline mt-1">Clear search</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} shopOwnerId={shop.userId} shopOwnerName={shop.ownerName} user={user} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-3">
          <div className="bg-muted/20 border rounded-xl p-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{demoRating}</p>
              <StarRow rating={demoRating} size="lg" />
              <p className="text-xs text-muted-foreground mt-1">{demoReviewCount} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {DEMO_REVIEWS.map((r) => (
              <div key={r.id} className="border rounded-xl p-4 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">{r.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <StarRow rating={r.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
            <p className="text-center text-xs text-muted-foreground py-2">Sample reviews shown for illustration</p>
          </div>
        </div>
      )}
    </div>
  );
}
