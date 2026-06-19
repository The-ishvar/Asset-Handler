import { CheckCircle, X, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS = {
  auto: "Auto / Tempo Ride",
  bus: "Bus Ticket",
  event: "Event Ticket",
  medical: "Medical Appointment",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-800",
};

export default function BookingConfirmation({ booking, onClose }) {
  if (!booking) return null;

  const details = booking.details || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Booking Confirmed!</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* QR Code */}
          {booking.qrCode && (
            <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-1">
                <QrCode className="w-4 h-4" /> Your Ticket QR Code
              </div>
              <img src={booking.qrCode} alt="QR Code" className="w-44 h-44 rounded-xl" />
              <p className="text-xs text-muted-foreground text-center">Screenshot this QR code to use at the time of service</p>
            </div>
          )}

          {/* Booking Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Booking ID</span>
              <span className="font-mono font-bold text-sm">#{booking.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="font-medium text-sm">{TYPE_LABELS[booking.bookingType] || booking.bookingType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[booking.status] || ""}`}>
                {booking.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-primary">₹{Number(booking.amount).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment</span>
              <span className="text-sm capitalize font-medium">{booking.paymentStatus}</span>
            </div>

            {details.pickup && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-muted-foreground shrink-0">From</span>
                <span className="font-medium text-sm text-right">{details.pickup}</span>
              </div>
            )}
            {details.destination && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-muted-foreground shrink-0">To</span>
                <span className="font-medium text-sm text-right">{details.destination}</span>
              </div>
            )}
            {details.date && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-medium text-sm">{details.date}</span>
              </div>
            )}
            {details.time && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time</span>
                <span className="font-medium text-sm">{details.time}</span>
              </div>
            )}
            {details.providerName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="font-medium text-sm">{details.providerName}</span>
              </div>
            )}
            {details.notes && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-muted-foreground shrink-0">Notes</span>
                <span className="text-sm text-right">{details.notes}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Booked on</span>
              <span className="text-sm">{new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t">
          <Button className="w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
