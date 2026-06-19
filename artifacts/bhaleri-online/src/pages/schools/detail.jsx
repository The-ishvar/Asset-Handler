import { useRoute, Link } from "wouter";
import { useGetSchool } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { School, MapPin, Phone, Clock, ArrowLeft, BookOpen, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SchoolDetail() {
  const [, params] = useRoute("/schools/:id");
  const { data: school, isLoading, error } = useGetSchool(Number(params?.id), { enabled: !!params?.id });

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
  if (error || !school) return (
    <div className="text-center py-20">
      <School className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-destructive">School not found.</p>
      <Link href="/schools"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/schools">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Schools
        </button>
      </Link>

      {/* Photo banner */}
      <div className="h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 shadow-md relative border border-border">
        {school.photoUrl ? (
          <img src={school.photoUrl} alt={school.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 bg-blue-200/60 dark:bg-blue-800/30 rounded-full flex items-center justify-center">
              <School className="w-10 h-10 text-blue-500" />
            </div>
            <span className="text-blue-400 text-sm font-medium">No photo added</span>
          </div>
        )}
        {school.type && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
            {school.type}
          </div>
        )}
      </div>

      <Card className="border-t-4 border-t-blue-500 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{school.name}</h1>
            {school.description && <p className="text-muted-foreground mt-2 leading-relaxed">{school.description}</p>}
          </div>

          {school.classInfo && (
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-blue-600 font-medium mb-0.5">Classes</div>
                <div className="text-sm">{school.classInfo}</div>
              </div>
            </div>
          )}

          {school.feeInfo && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              <IndianRupee className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-amber-600 font-medium mb-0.5">Fee Info</div>
                <div className="text-sm">{school.feeInfo}</div>
              </div>
            </div>
          )}

          <div className="grid gap-3 pt-1">
            {school.address && (
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 bg-muted rounded-full"><MapPin className="w-4 h-4 text-muted-foreground" /></div>
                <span className="mt-0.5">{school.address}</span>
              </div>
            )}
            {school.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-muted rounded-full"><Phone className="w-4 h-4 text-muted-foreground" /></div>
                <a href={`tel:${school.phone}`} className="text-primary hover:underline font-medium">{school.phone}</a>
              </div>
            )}
            {school.timing && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-muted rounded-full"><Clock className="w-4 h-4 text-muted-foreground" /></div>
                <span>{school.timing}</span>
              </div>
            )}
          </div>

          {school.phone && (
            <a href={`tel:${school.phone}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                <Phone className="w-4 h-4 mr-2" /> Call School
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
