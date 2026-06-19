import { Link } from "wouter";
import { useListSchools } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, MapPin, Phone, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SchoolsList() {
  const { data: schools, isLoading } = useListSchools();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
          <School className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Schools in Bhaleri</h1>
          <p className="text-muted-foreground">Educational institutions in the village</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : !schools?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <School className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No schools listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((school) => (
            <Link key={school.id} href={`/schools/${school.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border hover:border-blue-300 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span>{school.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  </CardTitle>
                  {school.type && <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full w-fit">{school.type}</span>}
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {school.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>{school.address}</span></div>}
                  {school.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><a href={`tel:${school.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{school.phone}</a></div>}
                  {school.description && <p className="line-clamp-2 pt-1">{school.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
