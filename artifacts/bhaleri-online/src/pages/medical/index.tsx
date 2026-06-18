import { useListMedical } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicalList() {
  const { data: medical, isLoading, error } = useListMedical();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Medical Stores & Clinics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load medical facilities.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Pill className="w-8 h-8" />
            Medical Stores
          </h1>
          <p className="text-muted-foreground mt-2">Find medicines, clinics, and health facilities in Bhaleri.</p>
        </div>
      </div>

      {!medical?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No medical stores listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medical.map(store => (
            <Link key={store.id} href={`/medical/${store.id}`}>
              <Card className="hover-elevate cursor-pointer h-full transition-all border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1 text-red-600">{store.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{store.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{store.contactNumber}</span>
                  </div>
                  {store.availableMedicines && (
                    <div className="text-xs bg-red-50 text-red-700 p-2 rounded-md line-clamp-2 mt-2">
                      {store.availableMedicines}
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
