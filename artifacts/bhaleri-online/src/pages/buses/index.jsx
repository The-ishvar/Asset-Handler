import { useListBuses } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, Clock, MapPin, ArrowRight, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BUS_COLORS = [
  { from: "from-yellow-400", to: "to-amber-500", light: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800", icon: "text-yellow-500" },
  { from: "from-orange-400", to: "to-red-500", light: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", icon: "text-orange-500" },
  { from: "from-blue-400", to: "to-indigo-500", light: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-500" },
  { from: "from-green-400", to: "to-emerald-500", light: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", icon: "text-green-500" },
  { from: "from-purple-400", to: "to-violet-500", light: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", icon: "text-purple-500" },
];

export default function BusList() {
  const { data: buses, isLoading } = useListBuses();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 rounded-full">
          <Bus className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Bus Timetable</h1>
          <p className="text-muted-foreground">Bus routes and timings from/to Bhaleri</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}</div>
      ) : !buses?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Bus className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No bus routes listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus, idx) => {
            const color = BUS_COLORS[idx % BUS_COLORS.length];
            return (
              <Card key={bus.id} className={`overflow-hidden hover:shadow-md transition-all ${color.border} border`}>
                {/* Colored top strip with bus icon */}
                <div className={`bg-gradient-to-r ${color.from} ${color.to} px-5 py-4 flex items-center gap-3`}>
                  <div className="bg-white/20 rounded-full p-2">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white flex-1 min-w-0">
                    <div className="font-bold text-lg leading-tight line-clamp-1">{bus.route}</div>
                    {bus.from && bus.to && (
                      <div className="flex items-center gap-1.5 text-white/80 text-sm mt-0.5">
                        <Navigation className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{bus.from} → {bus.to}</span>
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className={`p-4 ${color.light}`}>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {bus.timing && (
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${color.icon}`} />
                        <span className="font-medium">{bus.timing}</span>
                      </div>
                    )}
                    {bus.from && !bus.to && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className={`w-4 h-4 ${color.icon}`} />
                        <span>{bus.from}</span>
                      </div>
                    )}
                  </div>
                  {bus.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bus.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
