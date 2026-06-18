import { useListShops } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopsList() {
  const { data: shops, isLoading, error } = useListShops();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Local Shops</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load shops.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-3">
            <Store className="w-8 h-8" />
            Local Shops
          </h1>
          <p className="text-muted-foreground mt-2">Find groceries, hardware, clothing, and other shops in Bhaleri.</p>
        </div>
      </div>

      {!shops?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No shops listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map(shop => (
            <Link key={shop.id} href={`/shops/${shop.id}`}>
              <Card className="hover-elevate cursor-pointer h-full transition-all overflow-hidden group border-b-4 border-b-green-500">
                <div className="h-40 bg-green-50 overflow-hidden">
                  {shop.photoUrl ? (
                    <img 
                      src={shop.photoUrl} 
                      alt={shop.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-600/50">
                      <Store className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{shop.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{shop.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{shop.contactNumber}</span>
                  </div>
                  {shop.availableItems && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
                      {shop.availableItems}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
