import { useRoute } from "wouter";
import { useGetMedical } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MedicalDetail() {
  const [, params] = useRoute("/medical/:id");
  const id = Number(params?.id);
  
  const { data: store, isLoading, error } = useGetMedical(id, { 
    query: { enabled: !!id } 
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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

  if (error || !store) {
    return <div className="text-center py-10 text-destructive">Medical store not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6 flex items-center gap-3">
          <Pill className="w-8 h-8" />
          {store.name}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Available Medicines / Services
              </h2>
              <div className="text-muted-foreground whitespace-pre-wrap bg-red-50 p-6 rounded-xl border border-red-100 text-red-900">
                {store.availableMedicines || "Information not provided. Please call to inquire."}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-2">Contact Details</h3>
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                  <span>{store.location}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{store.contactNumber}</span>
                </div>

                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" asChild>
                  <a href={`tel:${store.contactNumber}`}>Call Now</a>
                </Button>
                
                {store.mapLocation && (
                  <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50" asChild>
                    <a href={store.mapLocation} target="_blank" rel="noopener noreferrer">
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
