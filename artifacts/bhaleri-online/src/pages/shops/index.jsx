import { Link } from "wouter";
import { useListShops } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Store, MapPin, Phone, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopsList() {
  const { data: shops, isLoading } = useListShops();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full">
          <Store className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Shops in Bhaleri</h1>
          <p className="text-muted-foreground">Local businesses and stores</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !shops?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Store className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No shops listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-green-300 h-full overflow-hidden group">
                {/* Photo */}
                <div className="h-44 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/20 overflow-hidden relative">
                  {shop.photoUrl ? (
                    <img
                      src={shop.photoUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-16 h-16 text-green-200 dark:text-green-800" />
                    </div>
                  )}
                  {shop.type && (
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 text-green-700 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                      {shop.type}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{shop.name}</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-green-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  {shop.address && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span className="line-clamp-1">{shop.address}</span>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-primary font-medium">{shop.phone}</span>
                    </div>
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
