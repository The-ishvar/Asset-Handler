import { useRoute, Link } from "wouter";
import { useGetListing } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, ShoppingBag, User, Calendar, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ListingDetail() {
  const [, params] = useRoute("/buy-sell/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { data: listing, isLoading, error } = useGetListing(id, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-32 w-full" /></div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !listing) return <div className="text-center py-10 text-destructive">Listing not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-[300px] md:h-[500px] rounded-xl overflow-hidden bg-purple-50 relative border border-purple-100">
        {listing.photoUrl ? (
          <img src={listing.photoUrl} alt={listing.title} className="w-full h-full object-contain bg-black/5" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-purple-300"><ShoppingBag className="w-32 h-32" /></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="text-3xl font-bold text-purple-700 mb-2">₹{Number(listing.price).toLocaleString("en-IN")}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{listing.title}</h1>
          </div>
          <section>
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Description</h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{listing.description || "No detailed description provided."}</div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-lg border-b pb-2">Seller Info</h3>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600"><User className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">Posted by</div>
                  <div className="font-medium">{listing.userName || "Resident"}</div>
                </div>
              </div>
              {listing.contactInfo && (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600"><Phone className="w-5 h-5" /></div>
                  <div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                    <a href={`tel:${listing.contactInfo}`} className="font-medium text-primary hover:underline">{listing.contactInfo}</a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Calendar className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">Listed on</div>
                  <div className="font-medium">{new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>
              {user && listing.userId !== user.id && (
                <Link href={`/messages/${listing.userId}`}>
                  <Button className="w-full"><MessageCircle className="w-4 h-4 mr-2" /> Message Seller</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
