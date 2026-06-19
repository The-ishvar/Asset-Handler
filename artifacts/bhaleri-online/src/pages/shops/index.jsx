import { Link } from "wouter";
import { useListShops } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Phone, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopsList() {
  const { data: shops, isLoading } = useListShops();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full"><Store className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold">Shops in Bhaleri</h1>
          <p className="text-muted-foreground">Local businesses and stores</p>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
      ) : !shops?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Store className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No shops listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border hover:border-green-300 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span>{shop.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  </CardTitle>
                  {shop.type && <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full w-fit">{shop.type}</span>}
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {shop.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>{shop.address}</span></div>}
                  {shop.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><a href={`tel:${shop.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{shop.phone}</a></div>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
