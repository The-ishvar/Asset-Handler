import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateBooking, useListEvents } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, IndianRupee, ChevronRight, Ticket } from "lucide-react";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { useToast } from "@/hooks/use-toast";

const TICKET_TIERS = [
  { label: "General Entry", price: 50 },
  { label: "VIP", price: 200 },
  { label: "Couple Pass", price: 90 },
];

export default function BookEvent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: events = [] } = useListEvents();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tier, setTier] = useState("General Entry");
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState(null);

  if (!user) { setLocation("/login"); return null; }

  const tierPrice = TICKET_TIERS.find(t => t.label === tier)?.price || 50;
  const totalFare = tierPrice * qty;

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedEvent) {
      toast({ title: "Please select an event", variant: "destructive" });
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
        tier,
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Select Event</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events available for booking.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {upcomingEvents.map(event => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${selectedEvent?.id === event.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                      {event.location && ` · ${event.location}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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

        {selectedEvent && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4" />
                  Total ({qty} × ₹{tierPrice})
                </div>
                <span className="text-xl font-bold text-primary">₹{totalFare}</span>
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
