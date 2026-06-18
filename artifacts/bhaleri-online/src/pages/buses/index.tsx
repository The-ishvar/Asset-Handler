import { useListBuses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Clock, MapPin, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusList() {
  const { data: buses, isLoading, error } = useListBuses();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Bus Timetable</h1>
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
    return <div className="text-center py-10 text-destructive">Failed to load bus schedule.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-yellow-600 flex items-center gap-3">
            <Bus className="w-8 h-8" />
            Bus Timetable
          </h1>
          <p className="text-muted-foreground mt-2">Local bus routes, timings, and fares from Bhaleri.</p>
        </div>
      </div>

      {!buses?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No bus routes listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map(bus => (
            <Card key={bus.id} className="border-t-4 border-t-yellow-500 hover-elevate transition-all">
              <CardHeader className="pb-3 bg-yellow-50/50">
                <CardTitle className="text-lg flex justify-between items-start gap-4">
                  <span className="line-clamp-2">{bus.name}</span>
                  <span className="text-yellow-700 font-bold whitespace-nowrap bg-yellow-100 px-2 py-1 rounded text-sm">
                    ₹{bus.fare}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Route</div>
                    <div className="font-medium">{bus.route}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Departure</div>
                      <div className="font-medium text-sm">{bus.departureTime}</div>
                    </div>
                  </div>
                  
                  {bus.arrivalTime && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground">Arrival</div>
                        <div className="font-medium text-sm">{bus.arrivalTime}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
