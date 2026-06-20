import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { useGetCart, useCreateOrder, useRemoveFromCart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Truck, ShoppingBag, CheckCircle, CreditCard, Package } from "lucide-react";

function parseFirstPhoto(photoUrl) {
  if (!photoUrl) return null;
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {}
  return photoUrl;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: cartItems = [], isLoading } = useGetCart({ enabled: !!user });
  const createOrder = useCreateOrder();
  const removeFromCart = useRemoveFromCart();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const subtotal = cartItems.reduce((sum, i) => sum + (i.listing?.price || 0) * (i.quantity || 1), 0);
  const total = subtotal;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      toast({ title: "Delivery details fill karein", variant: "destructive" }); return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Your cart is empty", variant: "destructive" }); return;
    }

    setPlacing(true);
    try {
      const deliveryAddress = `${name}, ${phone}\n${address}`;
      const results = [];

      for (const item of cartItems) {
        const order = await new Promise((resolve, reject) => {
          createOrder.mutate(
            { listingId: item.listingId, quantity: item.quantity || 1, deliveryAddress, paymentMethod: "cod", notes: notes || null },
            { onSuccess: resolve, onError: reject }
          );
        });
        results.push(order);
      }

      for (const item of cartItems) {
        await new Promise((resolve) => {
          removeFromCart.mutate(item.listingId, { onSuccess: resolve, onError: resolve });
        });
      }

      setOrderId(results[0]?.id);
      setSuccess(true);
    } catch {
      toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Placed!</h2>
          <p className="text-muted-foreground mt-2">
            Your order has been placed successfully. The seller will contact you on <strong>{phone}</strong> to confirm.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground mt-1">Order ID: <strong>#{orderId}</strong></p>
          )}
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-400 text-left space-y-1">
          <p className="font-semibold">💵 Cash on Delivery</p>
          <p>Please keep exact cash ready. Pay only after receiving your item.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setLocation("/")}>Go Home</Button>
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setLocation("/buy-sell")}>
            Shop More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/cart">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">No items in cart</p>
          <Link href="/buy-sell"><Button className="mt-4" variant="outline">Browse Marketplace</Button></Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="space-y-5">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-500" /> Order Summary ({cartItems.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => {
                const photo = parseFirstPhoto(item.listing?.photoUrl);
                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {photo
                        ? <img src={photo} alt={item.listing?.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        : <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.listing?.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="font-bold text-sm text-purple-700 dark:text-purple-400">
                      ₹{((item.listing?.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total Payable</span>
                <span className="text-purple-700 dark:text-purple-400">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Full Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone <span className="text-red-500">*</span></Label>
                  <Input placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Delivery Address <span className="text-red-500">*</span></Label>
                <Textarea placeholder="House no., Street, Ward, Village…" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} required />
              </div>
              <div className="space-y-1.5">
                <Label>Additional Notes (optional)</Label>
                <Input placeholder="Any special instructions for the seller" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-500" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 border-2 border-purple-500 rounded-xl bg-purple-50 dark:bg-purple-950/20">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">₹</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Cash on Delivery</div>
                  <p className="text-xs text-muted-foreground">Pay when you receive your item</p>
                </div>
                <div className="ml-auto">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 bg-purple-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Truck className="w-3 h-3" /> Online payment coming soon
              </p>
            </CardContent>
          </Card>

          {/* Place Order */}
          <div className="fixed bottom-16 left-0 right-0 md:static md:bottom-auto p-4 md:p-0 bg-background md:bg-transparent border-t md:border-0">
            <Button type="submit" disabled={placing}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold gap-2">
              {placing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order…</>
              ) : (
                <>✅ Place Order · ₹{total.toLocaleString("en-IN")}</>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
