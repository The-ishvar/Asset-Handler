import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListListings, ListingStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShoppingBag, PlusCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const CATEGORIES = [
  "All",
  "Electronics",
  "Vehicles",
  "Furniture",
  "Clothes",
  "Agriculture",
  "Land / Property",
  "Books",
  "Other",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function BuySellList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings, isLoading, error } = useListListings({ status: "approved" as ListingStatus });

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    let result = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "All") {
      const cat = selectedCategory.toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(cat) || (l.description?.toLowerCase().includes(cat)));
    }

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null) result = result.filter((l) => l.price >= min);
    if (max !== null) result = result.filter((l) => l.price <= max);

    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [listings, searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = selectedCategory !== "All" || minPrice || maxPrice || sortBy !== "newest";

  const clearFilters = () => {
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Buy & Sell
          </h1>
          <p className="text-muted-foreground mt-1">Marketplace for Bhaleri residents.</p>
        </div>
        <Link href="/buy-sell/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            Post an Item
          </Button>
        </Link>
      </div>

      {/* Search + Filter Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters((v) => !v)}
          className="shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-white text-purple-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">!</span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filter & Sort</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-destructive hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedCategory === cat
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-border hover:border-purple-400 hover:text-purple-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Min Price (₹)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Max Price (₹)</Label>
              <Input
                type="number"
                min="0"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Sort By</Label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    sortBy === opt.value
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-border hover:border-purple-400 hover:text-purple-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {!isLoading && listings && (
        <p className="text-sm text-muted-foreground">
          Showing <strong>{filteredListings.length}</strong> of <strong>{listings.length}</strong> listings
        </p>
      )}

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">Failed to load listings.</div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium">No items found.</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/buy-sell/${listing.id}`}>
              <Card className="hover:shadow-md cursor-pointer h-full transition-all overflow-hidden group flex flex-col border hover:border-purple-300">
                <div className="h-48 bg-purple-50 dark:bg-purple-950/30 overflow-hidden relative">
                  {listing.photoUrl ? (
                    <img
                      src={listing.photoUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-200 dark:text-purple-800">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-purple-700 dark:text-purple-400 font-bold text-sm shadow-sm">
                    ₹{listing.price.toLocaleString("en-IN")}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {listing.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 text-xs text-muted-foreground flex justify-between">
                  <span>{listing.userName || "Resident"}</span>
                  <span>{new Date(listing.createdAt).toLocaleDateString("en-IN")}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
