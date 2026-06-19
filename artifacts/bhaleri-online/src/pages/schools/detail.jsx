import { useRoute, Link } from "wouter";
import { useGetSchool } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { School, MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SchoolDetail() {
  const [, params] = useRoute("/schools/:id");
  const { data: school, isLoading, error } = useGetSchool(Number(params?.id), { enabled: !!params?.id });

  if (isLoading) return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-48 w-full" /></div>;
  if (error || !school) return <div className="text-center py-10 text-destructive">School not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/schools"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold">{school.name}</h1>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><School className="w-7 h-7" /></div>
            <div>
              <div className="font-bold text-xl">{school.name}</div>
              {school.type && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{school.type}</span>}
            </div>
          </div>
          {school.description && <p className="text-muted-foreground">{school.description}</p>}
          <div className="grid gap-3">
            {school.address && <div className="flex items-start gap-3 text-sm"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><span>{school.address}</span></div>}
            {school.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground shrink-0" /><a href={`tel:${school.phone}`} className="text-primary hover:underline">{school.phone}</a></div>}
            {school.timing && <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-muted-foreground shrink-0" /><span>{school.timing}</span></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
