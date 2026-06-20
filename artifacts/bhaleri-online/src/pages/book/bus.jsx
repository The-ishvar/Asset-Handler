import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateBooking, useListBuses } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, ChevronRight, IndianRupee, MapPin, Clock } from "lucide-react";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { useToast } from "@/hooks/use-toast";

const SEAT_CLASSES = [
  { label: "General", price: 30 },
  { label: "Reserved", price: 60 },
];

const DEMO_BUSES = [
  { id: "db1", from: "Bhaleri", to: "Jaipur", operator: "Rajasthan Roadways", departureTime: "06:00 AM", arrivalTime: "09:30 AM", seatsAvailable: 28, isDemo: true },
  { id: "db2", from: "Bhaleri", to: "Alwar", operator: "Haryana Express", departureTime: "08:30 AM", arrivalTime: "10:00 AM", seatsAvailable: 14, isDemo: true },
  { id: "db3", from: "Bhaleri", to: "Delhi", operator: "Volvo AC Express", departureTime: "10:00 AM", arrivalTime: "02:30 PM", seatsAvailable: 8, isDemo: true },
  { id: "db4", from: "Bhaleri", to: "Rewari", operator: "Mini Bus", departureTime: "12:00 PM", arrivalTime: "01:00 PM", seatsAvailable: 22, isDemo: true },
  { id: "db5", from: "Bhaleri", to: "Bhiwadi", operator: "Local Shuttle", departureTime: "03:00 PM", arrivalTime: "04:30 PM", seatsAvailable: 18, isDemo: true },
];

export default function BookBus() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: dbBuses = [] } = useListBuses();

  const [selectedBus, setSelectedBus] = useState(null);
  const [date, setDate] = useState("");
  const [seatClass, setSeatClass] = useState("General");
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const buses = dbBuses.length > 0 ? dbBuses : DEMO_BUSES;
  const isDemo = dbBuses.length === 0;
  const classPrice = SEAT_CLASSES.find(c => c.label === seatClass)?.price || 30;
  const totalFare = classPrice * qty;

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedBus || !date) {
      toast({ title: "Bus aur date select karein", variant: "destructive" });
      return;
    }
    createBooking.mutate({
      bookingType: "bus",
      amount: totalFare,
      details: {
        busId: isDemo ? selectedBus.id : selectedBus.id,
        busRoute: `${selectedBus.from} → ${selectedBus.to}`,
        providerName: selectedBus.operator,
        date, seatClass, qty,
        fare: totalFare,
        departureTime: selectedBus.departureTime,
        arrivalTime: selectedBus.arrivalTime,
        seatsBooked: qty,
      },
    }, {
      onSuccess: (b) => setConfirmed(b),
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
          <Bus className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Book Bus Ticket</h1>
          <p className="text-sm text-muted-foreground">Reserve your seat on local bus routes</p>
        </div>
      </div>

      {isDemo && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          🧪 <strong>Sample Data</strong> — No bus routes in database yet. Demo routes shown for preview.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Select Bus Route</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {buses.map(bus => (
                <button
                  key={bus.id}
                  type="button"
                  onClick={() => setSelectedBus(bus)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${selectedBus?.id === bus.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{bus.from} → {bus.to}</div>
                    {bus.seatsAvailable !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${bus.seatsAvailable > 10 ? "bg-green-100 text-green-700" : bus.seatsAvailable > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {bus.seatsAvailable} seats
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span>{bus.operator}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {bus.departureTime}</span>
                    {bus.arrivalTime && <span>→ {bus.arrivalTime}</span>}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Journey Details</h3>

            <div className="space-y-1.5">
              <Label>Travel Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
            </div>

            <div className="space-y-1.5">
              <Label>Seat Class</Label>
              <div className="flex gap-2">
                {SEAT_CLASSES.map(c => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setSeatClass(c.label)}
                    className={`flex-1 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${seatClass === c.label ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                  >
                    {c.label}<br /><span className="text-xs font-normal text-muted-foreground">₹{c.price}/seat</span>
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

        {selectedBus && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium">{selectedBus.from} → {selectedBus.to}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Departure</span>
                <span className="font-medium">{selectedBus.departureTime}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4" />
                  Total ({qty} × ₹{classPrice})
                </div>
                <span className="text-xl font-bold text-primary">₹{totalFare}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={createBooking.isPending || !selectedBus}>
          {createBooking.isPending ? "Booking..." : "Confirm Ticket"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {confirmed && <BookingConfirmation booking={confirmed} onClose={() => { setConfirmed(null); setLocation("/profile"); }} />}
    </div>
  );
}
