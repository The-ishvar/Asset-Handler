import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { useGetCart, useRemoveFromCart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function parseFirstPhoto(photoUrl) {
  if (!photoUrl) return null;
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {}
  return photoUrl;
}

export default function CartPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: cartItems, isLoading } = useGetCart({ enabled: !!user });
  const removeFromCart = useRemoveFromCart();

  if (!user) { setLocation("/login"); return null; }

  const handleRemove = (listingId) => {
    removeFromCart.mutate(listingId, {
      onSuccess: () => {
        toast({ title: "Removed from cart" });
        qc.invalidateQueries({ queryKey: ["cart"] });
      },
    });
  };

  const total = cartItems?.reduce((sum, i) => sum + (i.listing?.price || 0), 0) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingCart className="w-6 h-6" /> My Cart
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !cartItems?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Your cart is empty</p>
          <Link href="/buy-sell">
            <Button className="mt-4" variant="outline">Browse listings</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cartItems.map((item) => {
            const photo = parseFirstPhoto(item.listing?.photoUrl);
            return (
              <div key={item.id} className="flex gap-4 p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                  {photo
                    ? <img src={photo} alt={item.listing?.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    : <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/buy-sell/${item.listingId}`}>
                    <p className="font-semibold hover:underline truncate">{item.listing?.title}</p>
                  </Link>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-400 mt-1">
                    ₹{Number(item.listing?.price).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Seller: {item.listing?.userName || "Resident"}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.listingId)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-muted shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <div className="border-t pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total ({cartItems.length} items)</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">₹{total.toLocaleString("en-IN")}</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-[200px] text-right">Contact each seller directly to complete your purchase</p>
          </div>
        </div>
      )}
    </div>
  );
}
