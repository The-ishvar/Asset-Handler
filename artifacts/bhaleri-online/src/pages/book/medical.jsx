import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCreateBooking, useListMedical } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, ChevronRight, IndianRupee, Clock, Phone, Star } from "lucide-react";
import BookingConfirmation from "@/components/booking/BookingConfirmation";
import { useToast } from "@/hooks/use-toast";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
const CONSULT_FEE = 150;

const DEMO_CLINICS = [
  { id: "dm1", name: "Dr. Ramesh Sharma Clinic", type: "General Physician", phone: "9876001001", address: "Main Market, Bhaleri", fee: 150, isDemo: true },
  { id: "dm2", name: "Bhaleri Primary Health Center", type: "Government Health Center", phone: "9876001002", address: "Panchayat Road, Bhaleri", fee: 0, isDemo: true },
  { id: "dm3", name: "Dr. Sunita Agarwal", type: "Gynaecologist & Child Specialist", phone: "9876001003", address: "Near Bus Stand, Bhaleri", fee: 200, isDemo: true },
  { id: "dm4", name: "Jan Aushadhi Store & Clinic", type: "General & Dental", phone: "9876001004", address: "Ward No. 3, Bhaleri", fee: 100, isDemo: true },
];

export default function BookMedical() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { data: dbClinics = [] } = useListMedical();

  const [selectedClinic, setSelectedClinic] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [symptom, setSymptom] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const clinics = dbClinics.length > 0 ? dbClinics : DEMO_CLINICS;
  const isDemo = dbClinics.length === 0;
  const consultFee = selectedClinic?.fee ?? CONSULT_FEE;

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedClinic || !date || !timeSlot) {
      toast({ title: "Clinic, date aur time select karein", variant: "destructive" });
      return;
    }
    createBooking.mutate({
      bookingType: "medical",
      amount: consultFee,
      details: {
        clinicId: selectedClinic.id,
        providerName: selectedClinic.name,
        type: selectedClinic.type,
        address: selectedClinic.address,
        date,
        time: timeSlot,
        symptom: symptom || "General checkup",
        fare: consultFee,
      },
    }, {
      onSuccess: (b) => setConfirmed(b),
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <Stethoscope className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Book Medical Appointment</h1>
          <p className="text-sm text-muted-foreground">Book your appointment at a local clinic</p>
        </div>
      </div>

      {isDemo && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          🧪 <strong>Sample Data</strong> — No clinics in database yet. Demo clinics shown for preview.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Select Clinic / Doctor</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {clinics.map(clinic => (
                <button
                  key={clinic.id}
                  type="button"
                  onClick={() => setSelectedClinic(clinic)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${selectedClinic?.id === clinic.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{clinic.name}</div>
                    {clinic.phone && (
                      <a href={`tel:${clinic.phone}`} onClick={e => e.stopPropagation()} className="text-primary hover:text-primary/80">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    {clinic.type && <span>{clinic.type}</span>}
                    {clinic.address && <span>· {clinic.address}</span>}
                  </div>
                  <div className="text-xs font-semibold text-primary mt-1">
                    {clinic.fee === 0 ? "Free / Govt." : `₹${clinic.fee} consultation`}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Appointment Details</h3>

            <div className="space-y-1.5">
              <Label>Preferred Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Time Slot *</Label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl border-2 text-[11px] font-medium transition-colors ${timeSlot === slot ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/30"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Symptoms / Reason (Optional)</Label>
              <Input placeholder="e.g., Fever, General checkup, Back pain..." value={symptom} onChange={e => setSymptom(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IndianRupee className="w-4 h-4" />
                Consultation Fee
              </div>
              <span className="text-xl font-bold text-primary">
                {consultFee === 0 ? "Free" : `₹${consultFee}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={createBooking.isPending || !selectedClinic}>
          {createBooking.isPending ? "Booking..." : "Book Appointment"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {confirmed && <BookingConfirmation booking={confirmed} onClose={() => { setConfirmed(null); setLocation("/profile"); }} />}
    </div>
  );
}
