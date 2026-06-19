import { useListBuses } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusList() {
  const { data: buses, isLoading } = useListBuses();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 rounded-full"><Bus className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold">Bus Timetable</h1>
          <p className="text-muted-foreground">Bus routes and timings from/to Bhaleri</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      ) : !buses?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Bus className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No bus routes listed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {buses.map((bus) => (
            <Card key={bus.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      <Bus className="w-5 h-5 text-yellow-500" />
                      {bus.route}
                    </div>
                    {bus.description && <p className="text-sm text-muted-foreground mt-1">{bus.description}</p>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground shrink-0">
                    {bus.timing && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span>{bus.timing}</span>
                      </div>
                    )}
                    {bus.from && bus.to && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-yellow-500" />
                        <span>{bus.from} → {bus.to}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
