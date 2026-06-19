import { useRoute, Link } from "wouter";
import { useGetMedical } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MedicalDetail() {
  const [, params] = useRoute("/medical/:id");
  const { data: item, isLoading, error } = useGetMedical(Number(params?.id), { enabled: !!params?.id });

  if (isLoading) return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-48 w-full" /></div>;
  if (error || !item) return <div className="text-center py-10 text-destructive">Not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/medical"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold">{item.name}</h1>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-full"><Stethoscope className="w-7 h-7" /></div>
            <div>
              <div className="font-bold text-xl">{item.name}</div>
              {item.type && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{item.type}</span>}
            </div>
          </div>
          {item.description && <p className="text-muted-foreground">{item.description}</p>}
          <div className="grid gap-3">
            {item.address && <div className="flex items-start gap-3 text-sm"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><span>{item.address}</span></div>}
            {item.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground shrink-0" /><a href={`tel:${item.phone}`} className="text-primary hover:underline">{item.phone}</a></div>}
            {item.timing && <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-muted-foreground shrink-0" /><span>{item.timing}</span></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
