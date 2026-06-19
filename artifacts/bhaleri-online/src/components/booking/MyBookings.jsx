import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyBookings, useCancelBooking, useGetBooking } from "@/lib/api";
import { Car, Bus, Ticket, Stethoscope, QrCode, X, Loader2, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import BookingConfirmation from "./BookingConfirmation";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  confirmed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const PAYMENT_COLORS = {
  unpaid: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-purple-100 text-purple-700",
};

const TYPE_ICONS = { auto: Car, bus: Bus, event: Ticket, medical: Stethoscope };
const TYPE_COLORS = { auto: "text-orange-600", bus: "text-yellow-600", event: "text-teal-600", medical: "text-red-600" };

function BookingCard({ booking, onViewQR, onCancel }) {
  const Icon = TYPE_ICONS[booking.bookingType] || CalendarClock;
  const details = booking.details || {};
  const timeAgo = formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true });

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-muted/50 shrink-0 ${TYPE_COLORS[booking.bookingType]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground font-mono">#{booking.id}</div>
                <div className="font-semibold text-sm mt-0.5 truncate">
                  {booking.providerName || details.busRoute || details.providerName || "Provider TBD"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[booking.status]}`}>
                  {booking.status}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${PAYMENT_COLORS[booking.paymentStatus]}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {details.date && <span>📅 {details.date}</span>}
              {details.time && <span>🕐 {details.time}</span>}
              {details.pickup && <span>📍 {details.pickup} → {details.destination}</span>}
              <span className="text-primary font-bold">₹{Number(booking.amount).toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-2 text-[10px] text-muted-foreground">{timeAgo}</div>

            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs px-3 gap-1" onClick={() => onViewQR(booking)}>
                <QrCode className="w-3 h-3" /> QR / Details
              </Button>
              {booking.status === "pending" && (
                <Button size="sm" variant="outline" className="h-7 text-xs px-3 gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => onCancel(booking.id)}>
                  <X className="w-3 h-3" /> Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingTab({ type }) {
  const { data: bookings = [], isLoading } = useMyBookings(type);
  const cancelBooking = useCancelBooking();
  const { toast } = useToast();
  const [viewingBooking, setViewingBooking] = useState(null);

  function handleCancel(id) {
    cancelBooking.mutate(id, {
      onSuccess: () => toast({ title: "Booking cancelled" }),
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bookings.length) {
    const Icon = TYPE_ICONS[type] || CalendarClock;
    return (
      <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
        <Icon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-muted-foreground text-sm">No {type} bookings yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {bookings.map(b => (
          <BookingCard key={b.id} booking={b} onViewQR={setViewingBooking} onCancel={handleCancel} />
        ))}
      </div>
      {viewingBooking && (
        <BookingConfirmation booking={viewingBooking} onClose={() => setViewingBooking(null)} />
      )}
    </>
  );
}

export default function MyBookings() {
  return (
    <Tabs defaultValue="auto">
      <TabsList className="w-full grid grid-cols-4 h-auto p-1 mb-4">
        <TabsTrigger value="auto" className="text-xs flex items-center gap-1 py-2">
          <Car className="w-3 h-3" /> Auto
        </TabsTrigger>
        <TabsTrigger value="bus" className="text-xs flex items-center gap-1 py-2">
          <Bus className="w-3 h-3" /> Bus
        </TabsTrigger>
        <TabsTrigger value="event" className="text-xs flex items-center gap-1 py-2">
          <Ticket className="w-3 h-3" /> Events
        </TabsTrigger>
        <TabsTrigger value="medical" className="text-xs flex items-center gap-1 py-2">
          <Stethoscope className="w-3 h-3" /> Medical
        </TabsTrigger>
      </TabsList>
      <TabsContent value="auto" className="mt-0"><BookingTab type="auto" /></TabsContent>
      <TabsContent value="bus" className="mt-0"><BookingTab type="bus" /></TabsContent>
      <TabsContent value="event" className="mt-0"><BookingTab type="event" /></TabsContent>
      <TabsContent value="medical" className="mt-0"><BookingTab type="medical" /></TabsContent>
    </Tabs>
  );
}
