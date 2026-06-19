import { useRoute, Link } from "wouter";
import { useGetShop } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Store, MapPin, Phone, Clock, ArrowLeft, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ShopDetail() {
  const [, params] = useRoute("/shops/:id");
  const { data: shop, isLoading, error } = useGetShop(Number(params?.id), { enabled: !!params?.id });

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
  if (error || !shop) return (
    <div className="text-center py-20">
      <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-destructive">Shop not found.</p>
      <Link href="/shops"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/shops">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Shops
        </button>
      </Link>

      {/* Photo banner */}
      <div className="h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/20 shadow-md relative border border-border">
        {shop.photoUrl ? (
          <img src={shop.photoUrl} alt={shop.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 bg-green-200/60 dark:bg-green-800/30 rounded-full flex items-center justify-center">
              <Store className="w-10 h-10 text-green-500" />
            </div>
            <span className="text-green-400 text-sm font-medium">No photo added</span>
          </div>
        )}
        {shop.type && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 text-green-700 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
            {shop.type}
          </div>
        )}
      </div>

      <Card className="border-t-4 border-t-green-500 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            {shop.description && <p className="text-muted-foreground mt-2 leading-relaxed">{shop.description}</p>}
          </div>

          {shop.availableItems && (
            <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <Tag className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-green-600 font-medium mb-0.5">Available Items</div>
                <div className="text-sm">{shop.availableItems}</div>
              </div>
            </div>
          )}

          <div className="grid gap-3 pt-1">
            {shop.address && (
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 bg-muted rounded-full"><MapPin className="w-4 h-4 text-muted-foreground" /></div>
                <span className="mt-0.5">{shop.address}</span>
              </div>
            )}
            {shop.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-muted rounded-full"><Phone className="w-4 h-4 text-muted-foreground" /></div>
                <a href={`tel:${shop.phone}`} className="text-primary hover:underline font-medium">{shop.phone}</a>
              </div>
            )}
            {shop.timing && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-muted rounded-full"><Clock className="w-4 h-4 text-muted-foreground" /></div>
                <span>{shop.timing}</span>
              </div>
            )}
          </div>

          {shop.phone && (
            <a href={`tel:${shop.phone}`}>
              <Button className="w-full bg-green-600 hover:bg-green-700 mt-2">
                <Phone className="w-4 h-4 mr-2" /> Call Now
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
