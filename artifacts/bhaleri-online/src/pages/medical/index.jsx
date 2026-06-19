import { Link } from "wouter";
import { useListMedical } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, MapPin, Phone, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MedicalList() {
  const { data: medical, isLoading } = useListMedical();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full"><Stethoscope className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold">Medical Facilities</h1>
          <p className="text-muted-foreground">Hospitals, clinics, and pharmacies in Bhaleri</p>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
      ) : !medical?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Stethoscope className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No medical facilities listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medical.map((item) => (
            <Link key={item.id} href={`/medical/${item.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border hover:border-red-300 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span>{item.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  </CardTitle>
                  {item.type && <span className="text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full w-fit">{item.type}</span>}
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {item.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>{item.address}</span></div>}
                  {item.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><a href={`tel:${item.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{item.phone}</a></div>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
