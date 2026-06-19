import { useRoute, Link } from "wouter";
import { useGetUserShop as useGetShop } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Store, ArrowLeft, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function parsePhotos(photos) {
  if (!photos) return [];
  try {
    const parsed = JSON.parse(photos);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return photos ? [photos] : [];
}

export default function ShopView() {
  const [, params] = useRoute("/shop/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { data: shop, isLoading, error } = useGetShop(id, { enabled: !!id });

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );

  if (error || !shop) return (
    <div className="text-center py-20">
      <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-destructive">Shop not found.</p>
      <Link href="/buy-sell"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/buy-sell">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </Link>

      <div className="flex items-center gap-4 p-5 border rounded-xl bg-card">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full text-purple-600">
          <Store className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{shop.name}</h1>
          {shop.description && <p className="text-muted-foreground text-sm mt-1">{shop.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={shop.ownerAvatar || ""} />
              <AvatarFallback className="text-xs">{(shop.ownerName || "?").charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{shop.ownerName}</span>
          </div>
        </div>
        {user && shop.userId !== user.id && (
          <Link href={`/messages/${shop.userId}`}>
            <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 mr-1" /> Message</Button>
          </Link>
        )}
      </div>

      <h2 className="text-lg font-semibold">Items ({shop.items?.length || 0})</h2>

      {!shop.items?.length ? (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No items in this shop yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shop.items.map((item) => {
            const photos = parsePhotos(item.photos);
            return (
              <div key={item.id} className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                <div className="h-44 bg-muted flex items-center justify-center">
                  {photos[0]
                    ? <img src={photos[0]} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    : <Store className="w-10 h-10 text-muted-foreground/30" />}
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-purple-700 dark:text-purple-400 font-bold text-lg">₹{Number(item.price).toLocaleString("en-IN")}</p>
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                  {user && shop.userId !== user.id && (
                    <Link href={`/messages/${shop.userId}`}>
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        <MessageCircle className="w-3.5 h-3.5 mr-1" /> Contact Seller
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
