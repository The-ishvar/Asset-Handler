import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useProviderDashboard, useProviderEarnings, useUpdateBookingStatus } from "@/lib/api";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IndianRupee, ClipboardList, CheckCircle2, XCircle, Trophy,
  Car, Bus, Ticket, Stethoscope, Loader2, CalendarClock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-800",
};

const TYPE_ICONS = { auto: Car, bus: Bus, event: Ticket, medical: Stethoscope };

function ProviderBookingCard({ booking, onStatusChange, loading }) {
  const Icon = TYPE_ICONS[booking.bookingType] || CalendarClock;
  const details = booking.details || {};

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted/50 rounded-lg shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground font-mono">#{booking.id} · {booking.bookingType}</div>
                <div className="font-semibold text-sm mt-0.5">
                  {details.pickup ? `${details.pickup} → ${details.destination}` :
                    details.busRoute || details.providerName || `Booking #${booking.id}`}
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLORS[booking.status]}`}>
                {booking.status}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {details.date && <span>📅 {details.date}</span>}
              {details.time && <span>🕐 {details.time}</span>}
              <span className="font-bold text-primary">₹{Number(booking.amount).toLocaleString("en-IN")}</span>
              <span>{formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}</span>
            </div>

            {booking.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs px-3 bg-green-600 hover:bg-green-700"
                  onClick={() => onStatusChange(booking.id, "accepted")}
                  disabled={loading === booking.id}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-3 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onStatusChange(booking.id, "rejected")}
                  disabled={loading === booking.id}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            )}

            {booking.status === "accepted" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onStatusChange(booking.id, "confirmed")}
                  disabled={loading === booking.id}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-3 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onStatusChange(booking.id, "rejected")}
                  disabled={loading === booking.id}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            )}

            {booking.status === "confirmed" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => onStatusChange(booking.id, "completed")}
                  disabled={loading === booking.id}
                >
                  <Trophy className="w-3 h-3 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data, isLoading } = useProviderDashboard({ enabled: !!user });
  const { data: earningsData } = useProviderEarnings({ enabled: !!user });
  const updateStatus = useUpdateBookingStatus();
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  function handleStatusChange(id, status) {
    setLoadingId(id);
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Booking #${id} marked as ${status}` }),
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
      onSettled: () => setLoadingId(null),
    });
  }

  const bookings = data?.bookings || [];
  const provider = data?.provider;
  const pending = bookings.filter(b => b.status === "pending");
  const active = bookings.filter(b => ["accepted", "confirmed"].includes(b.status));
  const done = bookings.filter(b => ["completed", "cancelled", "rejected"].includes(b.status));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ClipboardList className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Provider Dashboard</h1>
          {provider && <p className="text-sm text-muted-foreground">{provider.name} · {provider.type}</p>}
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xs font-medium">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              ₹{(earningsData?.totalEarnings || 0).toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold">{earningsData?.completedBookings || 0}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1">
            <TabsTrigger value="pending" className="text-xs py-2">
              Pending {pending.length > 0 && <span className="ml-1 bg-yellow-500 text-white text-[10px] rounded-full px-1.5">{pending.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs py-2">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="history" className="text-xs py-2">History ({done.length})</TabsTrigger>
          </TabsList>

          {[["pending", pending], ["active", active], ["history", done]].map(([tab, list]) => (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
              {list.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
                  <p className="text-muted-foreground text-sm">No {tab} bookings.</p>
                </div>
              ) : (
                list.map(b => (
                  <ProviderBookingCard
                    key={b.id}
                    booking={b}
                    onStatusChange={handleStatusChange}
                    loading={loadingId}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
