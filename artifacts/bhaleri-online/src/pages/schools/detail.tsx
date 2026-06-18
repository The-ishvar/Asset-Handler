import { useRoute } from "wouter";
import { useGetSchool } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, GraduationCap, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SchoolDetail() {
  const [, params] = useRoute("/schools/:id");
  const id = Number(params?.id);
  
  const { data: school, isLoading, error } = useGetSchool(id, { 
    query: { enabled: !!id } 
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !school) {
    return <div className="text-center py-10 text-destructive">School not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-[300px] md:h-[400px] rounded-xl overflow-hidden bg-muted relative">
        {school.photoUrl ? (
          <img 
            src={school.photoUrl} 
            alt={school.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
            {school.name}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">{school.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Classes & Admission
              </h2>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {school.classInfo || "Information not provided."}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Fee Structure
              </h2>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {school.feeInfo || "Fee details available upon contact."}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-2">Contact Details</h3>
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>{school.address}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{school.contactNumber}</span>
                </div>

                <Button className="w-full mt-4" asChild>
                  <a href={`tel:${school.contactNumber}`}>Call Now</a>
                </Button>
                
                {school.mapLocation && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={school.mapLocation} target="_blank" rel="noopener noreferrer">
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
