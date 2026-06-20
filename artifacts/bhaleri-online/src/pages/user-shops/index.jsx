import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListUserShops } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Store, Search, Star, MapPin, Package,
  ShoppingBag, PlusCircle, Clock, CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEMO_SHOPS = [
  {
    id: "demo-1", name: "Bhaleri Medical Store", ownerName: "Dr. Ramesh Kumar",
    description: "Medicines, health products, and medical equipment",
    category: "Medical", location: "Main Market, Bhaleri", rating: 4.8, reviewCount: 42,
    itemCount: 35, isOpen: true, deliveryAvailable: true,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-2", name: "Shree Ram Kirana Store", ownerName: "Shyam Lal",
    description: "Daily grocery items, household essentials and snacks",
    category: "Grocery", location: "Ward No. 3, Bhaleri", rating: 4.5, reviewCount: 67,
    itemCount: 120, isOpen: true, deliveryAvailable: true,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-3", name: "Bhaleri Mobile Point", ownerName: "Vikas Sharma",
    description: "Mobile phones, accessories, recharge and repairs",
    category: "Electronics", location: "Bus Stand Road, Bhaleri", rating: 4.3, reviewCount: 28,
    itemCount: 48, isOpen: true, deliveryAvailable: false,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-4", name: "Kisan Agro Center", ownerName: "Suresh Yadav",
    description: "Seeds, fertilizers, farming tools and pesticides",
    category: "Farming", location: "Agricultural Area, Bhaleri", rating: 4.6, reviewCount: 31,
    itemCount: 60, isOpen: false, deliveryAvailable: true,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-5", name: "Bhaleri Fashion Hub", ownerName: "Priya Devi",
    description: "Ethnic wear, sarees, shirts, and fashion accessories",
    category: "Fashion", location: "Market Square, Bhaleri", rating: 4.4, reviewCount: 19,
    itemCount: 85, isOpen: true, deliveryAvailable: true,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-6", name: "Maa Bhawani Sweets", ownerName: "Govind Halwai",
    description: "Fresh sweets, namkeen, snacks and festival specials",
    category: "Food", location: "Temple Road, Bhaleri", rating: 4.9, reviewCount: 88,
    itemCount: 22, isOpen: true, deliveryAvailable: false,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-7", name: "Fresh Vegetable Market", ownerName: "Raju Sabziwala",
    description: "Daily fresh vegetables, fruits and seasonal produce",
    category: "Grocery", location: "Sabzi Mandi, Bhaleri", rating: 4.2, reviewCount: 54,
    itemCount: 40, isOpen: true, deliveryAvailable: true,
    logo: null, _isDemo: true,
  },
  {
    id: "demo-8", name: "Bhaleri Hardware Store", ownerName: "Manoj Mistri",
    description: "Construction materials, tools, paints and hardware",
    category: "Hardware", location: "Industrial Area, Bhaleri", rating: 4.1, reviewCount: 15,
    itemCount: 200, isOpen: true, deliveryAvailable: false,
    logo: null, _isDemo: true,
  },
];

const CATEGORIES = ["All", "Grocery", "Medical", "Electronics", "Fashion", "Food", "Farming", "Hardware", "Others"];

const CATEGORY_COLORS = {
  Grocery: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Medical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Electronics: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Fashion: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Farming: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  Hardware: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

function StarRow({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)} ({count})</span>
    </div>
  );
}

function ShopCard({ shop, isDemo }) {
  const categoryColor = CATEGORY_COLORS[shop.category] || "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";

  const linkHref = isDemo ? "#" : `/shop/${shop.id}`;

  return (
    <Link href={linkHref}>
      <div className={`border rounded-xl bg-card hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer ${isDemo ? "opacity-90" : ""}`}>
        <div className="h-28 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 flex items-center justify-center relative">
          {shop.logo ? (
            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-12 h-12 text-purple-300 dark:text-purple-700 group-hover:scale-110 transition-transform duration-200" />
          )}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColor}`}>
              {shop.category || "Shop"}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            {shop.isOpen !== false ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full">
                <CheckCircle className="w-2.5 h-2.5" /> Open
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-gray-400 text-white px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" /> Closed
              </span>
            )}
          </div>
        </div>

        <div className="p-3 space-y-2">
          <div>
            <h3 className="font-bold text-sm line-clamp-1">{shop.name}</h3>
            {shop.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{shop.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5 shrink-0">
              <AvatarImage src={shop.ownerAvatar || ""} />
              <AvatarFallback className="text-[9px]">{(shop.ownerName || "?").charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{shop.ownerName || "Owner"}</span>
          </div>

          {(shop.rating || 0) > 0 && (
            <StarRow rating={shop.rating || 0} count={shop.reviewCount || 0} />
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>{shop.itemCount || shop.items?.length || 0} products</span>
            </div>
            {shop.location && (
              <div className="flex items-center gap-1 truncate max-w-[50%]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{shop.location}</span>
              </div>
            )}
          </div>

          {shop.deliveryAvailable && (
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              🚚 Delivery Available
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function UserShopsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: realShops = [], isLoading } = useListUserShops();

  const showDemo = !isLoading && realShops.length === 0;
  const shops = showDemo ? DEMO_SHOPS : realShops.map(s => ({
    ...s, rating: s.rating || 0, reviewCount: s.reviewCount || 0,
    itemCount: s.items?.length || 0, isOpen: true,
  }));

  const filtered = useMemo(() => {
    let result = shops;
    if (activeCategory !== "All") result = result.filter(s => s.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.ownerName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [shops, activeCategory, search]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Store className="w-6 h-6" /> Shops
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Local shops in Bhaleri</p>
        </div>
        {user && (
          <Link href="/my-shop">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">My Shop</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search shops, owners, locations…"
          className="pl-9 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-border text-foreground/70 hover:border-purple-400 hover:text-purple-600 bg-background"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showDemo && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Sample Data</strong> — No shops yet. Be the first to open your shop!
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <Skeleton className="h-28 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Store className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No shops found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
          {(search || activeCategory !== "All") && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((shop) => (
            <ShopCard key={shop.id} shop={shop} isDemo={!!shop._isDemo} />
          ))}
        </div>
      )}
    </div>
  );
}
