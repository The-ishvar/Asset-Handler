import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { useGetCart, useRemoveFromCart, useUpdateCartQuantity } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, ShoppingBag, Plus, Minus, Tag, Truck, ArrowRight } from "lucide-react";

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
  const { data: cartItems = [], isLoading } = useGetCart({ enabled: !!user });
  const removeFromCart = useRemoveFromCart();
  const updateQty = useUpdateCartQuantity();
  const [removingId, setRemovingId] = useState(null);

  if (!user) { setLocation("/login"); return null; }

  const handleRemove = (listingId) => {
    setRemovingId(listingId);
    removeFromCart.mutate(listingId, {
      onSuccess: () => toast({ title: "Removed from cart" }),
      onSettled: () => setRemovingId(null),
    });
  };

  const handleQty = (listingId, newQty) => {
    if (newQty < 1) return;
    updateQty.mutate({ listingId, quantity: newQty });
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.listing?.price || 0) * (i.quantity || 1), 0);
  const originalTotal = cartItems.reduce((sum, i) => {
    const mrp = i.listing?.discountPrice;
    return sum + (mrp && mrp > (i.listing?.price || 0) ? mrp : (i.listing?.price || 0)) * (i.quantity || 1);
  }, 0);
  const discount = Math.max(0, originalTotal - subtotal);
  const delivery = subtotal > 0 ? 0 : 0;
  const total = subtotal + delivery;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> My Cart
          {cartItems.length > 0 && <span className="text-sm text-muted-foreground font-normal">({cartItems.length} items)</span>}
        </h1>
        {cartItems.length > 0 && (
          <Link href="/buy-sell">
            <span className="text-sm text-primary hover:underline">+ Add more</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : !cartItems.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <ShoppingCart className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Browse the marketplace and add items</p>
          <Link href="/buy-sell">
            <Button className="mt-5 bg-purple-600 hover:bg-purple-700">Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item) => {
              const photo = parseFirstPhoto(item.listing?.photoUrl);
              const price = item.listing?.price || 0;
              const mrp = item.listing?.discountPrice;
              const qty = item.quantity || 1;
              const isRemoving = removingId === item.listingId;

              return (
                <div key={item.id} className={`flex gap-3 p-3 border rounded-xl bg-card transition-opacity ${isRemoving ? "opacity-50" : ""}`}>
                  {/* Image */}
                  <Link href={`/buy-sell/${item.listingId}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                      {photo
                        ? <img src={photo} alt={item.listing?.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        : <ShoppingBag className="w-8 h-8 text-purple-200" />}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link href={`/buy-sell/${item.listingId}`}>
                      <p className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{item.listing?.title}</p>
                    </Link>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-purple-700 dark:text-purple-400">₹{price.toLocaleString("en-IN")}</span>
                      {mrp && mrp > price && (
                        <span className="text-xs text-muted-foreground line-through">₹{Number(mrp).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">by {item.listing?.userName || "Seller"}</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button onClick={() => handleQty(item.listingId, qty - 1)} disabled={qty <= 1}
                          className="px-2.5 py-1 hover:bg-muted transition-colors disabled:opacity-40 text-sm">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold border-x">{qty}</span>
                        <button onClick={() => handleQty(item.listingId, qty + 1)}
                          className="px-2.5 py-1 hover:bg-muted transition-colors text-sm">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">= ₹{(price * qty).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => handleRemove(item.listingId)} disabled={isRemoving}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-muted self-start shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div className="border rounded-xl p-4 space-y-3 bg-card">
            <h3 className="font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-green-500" /> Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Total ({cartItems.length})</span>
                <span>₹{originalTotal.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>− ₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total Payable</span>
                <span className="text-purple-700 dark:text-purple-400">₹{total.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs rounded-lg p-2 text-center font-medium">
                  🎉 You save ₹{discount.toLocaleString("en-IN")} on this order!
                </div>
              )}
            </div>
          </div>

          {/* Checkout button */}
          <div className="fixed bottom-16 left-0 right-0 md:static md:bottom-auto p-4 md:p-0 bg-background md:bg-transparent border-t md:border-0">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-semibold gap-2"
              onClick={() => setLocation("/checkout")}
            >
              Proceed to Checkout · ₹{total.toLocaleString("en-IN")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
