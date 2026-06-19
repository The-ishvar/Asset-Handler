import { Link } from "wouter";
import { useListSchools } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { School, MapPin, Phone, ArrowRight, Clock } from "lucide-react";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !schools?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <School className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No schools listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schools.map((school) => (
            <Link key={school.id} href={`/schools/${school.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-blue-300 h-full overflow-hidden group">
                {/* Photo */}
                <div className="h-44 bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 overflow-hidden relative">
                  {school.photoUrl ? (
                    <img
                      src={school.photoUrl}
                      alt={school.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <School className="w-16 h-16 text-blue-200 dark:text-blue-800" />
                    </div>
                  )}
                  {school.type && (
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                      {school.type}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{school.name}</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  {school.address && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span className="line-clamp-1">{school.address}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-primary font-medium">{school.phone}</span>
                    </div>
                  )}
                  {school.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">{school.description}</p>
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
