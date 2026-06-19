import { useListEvents } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsList() {
  const { data: events, isLoading } = useListEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-full"><Calendar className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Community events, festivals, and gatherings</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
      ) : !events?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No upcoming events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="text-center bg-pink-100 dark:bg-pink-950 rounded-xl p-3 shrink-0 min-w-[56px]">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 leading-none">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-xs text-pink-500 dark:text-pink-400 mt-1">
                      {new Date(event.date).toLocaleString("en-IN", { month: "short" }).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    {event.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {event.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {event.time}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>}
                    </div>
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
