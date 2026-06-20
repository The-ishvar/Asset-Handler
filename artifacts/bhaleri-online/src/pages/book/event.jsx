import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateBooking, useListEvents } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, IndianRupee, ChevronRight, Ticket, MapPin, Clock } from "lucide-react";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { useToast } from "@/hooks/use-toast";

const TICKET_TIERS = [
  { label: "General Entry", price: 50 },
  { label: "VIP", price: 200 },
  { label: "Couple Pass", price: 90 },
];

const today = new Date();
const addDays = (n) => new Date(today.getTime() + n * 86400000).toISOString().split("T")[0];

const DEMO_EVENTS = [
  { id: "de1", title: "Bhaleri Mela 2026 — Summer Festival", date: addDays(5), time: "05:00 PM", location: "Gram Panchayat Ground, Bhaleri", description: "Annual village fair with cultural programs, food stalls & competitions", ticketPrice: 50, availableSeats: 500, isDemo: true },
  { id: "de2", title: "Independence Day Celebration", date: addDays(12), time: "08:00 AM", location: "School Ground, Bhaleri", description: "Flag hoisting, parade & cultural events", ticketPrice: 0, availableSeats: 1000, isDemo: true },
  { id: "de3", title: "Yoga & Health Camp", date: addDays(3), time: "06:00 AM", location: "Community Hall, Bhaleri", description: "Free yoga session & health checkup camp", ticketPrice: 0, availableSeats: 200, isDemo: true },
  { id: "de4", title: "Village Cricket Tournament", date: addDays(8), time: "09:00 AM", location: "Sports Ground, Bhaleri", description: "Annual inter-ward cricket tournament. Register your team!", ticketPrice: 20, availableSeats: 150, isDemo: true },
];

export default function BookEvent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: dbEvents = [] } = useListEvents();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tier, setTier] = useState("General Entry");
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const upcomingDbEvents = dbEvents.filter(e => new Date(e.date) >= new Date());
  const events = upcomingDbEvents.length > 0 ? upcomingDbEvents : DEMO_EVENTS;
  const isDemo = upcomingDbEvents.length === 0;

  const tierPrice = selectedEvent?.ticketPrice === 0
    ? 0
    : TICKET_TIERS.find(t => t.label === tier)?.price || 50;
  const totalFare = tierPrice * qty;

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedEvent) {
      toast({ title: "Event select karein", variant: "destructive" });
      return;
    }
    createBooking.mutate({
      bookingType: "event",
      amount: totalFare,
      details: {
        eventId: selectedEvent.id,
        providerName: selectedEvent.title,
        date: selectedEvent.date,
        time: selectedEvent.time,
        location: selectedEvent.location,
        tier: tierPrice === 0 ? "Free Entry" : tier,
        qty,
        fare: totalFare,
      },
    }, {
      onSuccess: (b) => setConfirmed(b),
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
          <Ticket className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Book Event Ticket</h1>
          <p className="text-sm text-muted-foreground">Get your ticket for upcoming events</p>
        </div>
      </div>

      {isDemo && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          🧪 <strong>Sample Data</strong> — No upcoming events in database. Demo events shown for preview.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Select Event</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {events.map(event => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => { setSelectedEvent(event); if (event.ticketPrice === 0) setTier("General Entry"); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${selectedEvent?.id === event.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm leading-snug">{event.title}</div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${event.ticketPrice === 0 ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}>
                      {event.ticketPrice === 0 ? "FREE" : `₹${event.ticketPrice}`}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                    </span>
                    {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>}
                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                  </div>
                  {event.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedEvent && selectedEvent.ticketPrice !== 0 && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Ticket Details</h3>

              <div className="space-y-1.5">
                <Label>Ticket Tier</Label>
                <div className="space-y-2">
                  {TICKET_TIERS.map(t => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTier(t.label)}
                      className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-colors text-sm ${tier === t.label ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                    >
                      <span className="font-medium">{t.label}</span>
                      <span className="text-primary font-bold">₹{t.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Number of Tickets</Label>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
                  <span className="w-8 text-center font-bold text-lg">{qty}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => setQty(q => Math.min(10, q + 1))}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEvent && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4" />
                  {totalFare === 0 ? "Free Event" : `Total (${qty} × ₹${tierPrice})`}
                </div>
                <span className="text-xl font-bold text-primary">
                  {totalFare === 0 ? "FREE" : `₹${totalFare}`}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={createBooking.isPending || !selectedEvent}>
          {createBooking.isPending ? "Booking..." : "Get Tickets"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {confirmed && <BookingConfirmation booking={confirmed} onClose={() => { setConfirmed(null); setLocation("/profile"); }} />}
    </div>
  );
}
