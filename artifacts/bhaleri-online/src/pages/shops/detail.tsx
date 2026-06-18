import { useRoute } from "wouter";
import { useGetShop } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Store, IndianRupee, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ShopDetail() {
  const [, params] = useRoute("/shops/:id");
  const id = Number(params?.id);
  
  const { data: shop, isLoading, error } = useGetShop(id, { 
    query: { enabled: !!id } 
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return <div className="text-center py-10 text-destructive">Shop not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-[300px] rounded-xl overflow-hidden bg-green-50 relative border border-green-100">
        {shop.photoUrl ? (
          <img 
            src={shop.photoUrl} 
            alt={shop.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-green-600/50">
            <Store className="w-24 h-24" />
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">{shop.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <Tag className="w-5 h-5 text-green-600" />
                Available Items
              </h2>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {shop.availableItems || "Information not provided."}
              </div>
            </section>

            {shop.price && (
              <section>
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  Price Range
                </h2>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {shop.price}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-2">Shop Details</h3>
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                  <span>{shop.location}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{shop.contactNumber}</span>
                </div>

                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white" asChild>
                  <a href={`tel:${shop.contactNumber}`}>Call Shop</a>
                </Button>
                
                {shop.mapLocation && (
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50" asChild>
                    <a href={shop.mapLocation} target="_blank" rel="noopener noreferrer">
                      View on Map
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
