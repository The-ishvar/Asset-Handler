import { useListEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsList() {
  const { data: events, isLoading, error } = useListEvents();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
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
    return <div className="text-center py-10 text-destructive">Failed to load events.</div>;
  }

  // Sort events by date (upcoming first)
  const sortedEvents = events ? [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-pink-600 flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Upcoming Events
          </h1>
          <p className="text-muted-foreground mt-2">Festivals, meetings, and community gatherings in Bhaleri.</p>
        </div>
      </div>

      {!sortedEvents.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No upcoming events listed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map(event => {
            const eventDate = new Date(event.date);
            const month = eventDate.toLocaleString('default', { month: 'short' });
            const day = eventDate.getDate();

            return (
              <Card key={event.id} className="overflow-hidden hover-elevate transition-all flex flex-col">
                <div className="flex">
                  <div className="bg-pink-600 text-white flex flex-col items-center justify-center p-4 min-w-[80px]">
                    <span className="text-sm font-medium uppercase">{month}</span>
                    <span className="text-2xl font-bold">{day}</span>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
                  </div>
                </div>
                
                <CardContent className="flex-1 py-4 border-t border-pink-100 bg-pink-50/30">
                  <div className="space-y-3">
                    {event.time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-pink-500" />
                        {event.time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 text-pink-500 shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    )}
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground pt-3 border-t line-clamp-3">
                        {event.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
