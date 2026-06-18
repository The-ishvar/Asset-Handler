import { useState } from "react";
import { Link } from "wouter";
import { useListListings, ListingStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShoppingBag, PlusCircle, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export default function BuySellList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // We only fetch approved listings for the public page
  const { data: listings, isLoading, error } = useListListings({ status: "approved" as ListingStatus });

  const filteredListings = listings?.filter(listing => 
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (listing.description && listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Buy & Sell
          </h1>
          <p className="text-muted-foreground mt-2">Marketplace for Bhaleri residents to buy and sell items.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Link href="/buy-sell/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post an Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search items..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">Failed to load listings.</div>
      ) : !filteredListings?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No items found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map(listing => (
            <Link key={listing.id} href={`/buy-sell/${listing.id}`}>
              <Card className="hover-elevate cursor-pointer h-full transition-all overflow-hidden group flex flex-col">
                <div className="h-48 bg-purple-50 overflow-hidden relative">
                  {listing.photoUrl ? (
                    <img 
                      src={listing.photoUrl} 
                      alt={listing.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-300">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-purple-700 font-bold text-sm shadow-sm">
                    ₹{listing.price}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {listing.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 text-xs text-muted-foreground flex justify-between">
                  <span>By {listing.userName || "Resident"}</span>
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
