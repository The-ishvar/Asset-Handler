import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateBooking, useListProviders } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Car, MapPin, Clock, IndianRupee, ChevronRight } from "lucide-react";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { useToast } from "@/hooks/use-toast";

const FARE_PER_KM = 15;

export default function BookAuto() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: providers = [] } = useListProviders("auto");

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [providerId, setProviderId] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  if (!user) { setLocation("/login"); return null; }

  const estimatedKm = pickup && destination ? Math.ceil(Math.random() * 8 + 2) : 0;
  const fare = estimatedKm * FARE_PER_KM;
  const selectedProvider = providers.find(p => String(p.id) === String(providerId));

  function handleSubmit(e) {
    e.preventDefault();
    if (!pickup || !destination || !date || !time) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createBooking.mutate({
      bookingType: "auto",
      providerId: providerId ? parseInt(providerId) : undefined,
      amount: fare,
      details: {
        pickup, destination, date, time,
        providerName: selectedProvider?.name,
        estimatedKm, fare, notes
      },
    }, {
      onSuccess: (b) => setConfirmed(b),
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
          <Car className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Book Auto / Tempo</h1>
          <p className="text-sm text-muted-foreground">Local rides within Bhaleri area</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Ride Details</h3>

            <div className="space-y-1.5">
              <Label>Pickup Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Enter pickup point" value={pickup} onChange={e => setPickup(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Destination *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-primary" />
                <Input className="pl-9" placeholder="Enter destination" value={destination} onChange={e => setDestination(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
              </div>
              <div className="space-y-1.5">
                <Label>Time *</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {providers.length > 0 && (
          <Card>
            <CardContent className="pt-5 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Select Driver (Optional)</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setProviderId("")}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors text-sm ${!providerId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                >
                  Any available driver
                </button>
                {providers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProviderId(String(p.id))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${String(p.id) === String(providerId) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                  >
                    <div className="font-medium text-sm">{p.name}</div>
                    {p.description && <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {pickup && destination && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4" />
                  Estimated Fare (~{estimatedKm} km)
                </div>
                <span className="text-xl font-bold text-primary">₹{fare}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-1.5">
          <Label>Additional Notes (Optional)</Label>
          <Input placeholder="Any special requests..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={createBooking.isPending}>
          {createBooking.isPending ? "Booking..." : "Confirm Booking"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {confirmed && <BookingConfirmation booking={confirmed} onClose={() => { setConfirmed(null); setLocation("/profile"); }} />}
    </div>
  );
}
