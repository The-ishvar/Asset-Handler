import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, Shield, Eye, EyeOff, Lock, RefreshCw, CheckCircle2 } from "lucide-react";
import { useForgotPassword, useVerifyOtp, useResetPassword } from "@/lib/api";

const STEPS = { PHONE: 1, OTP: 2, PASSWORD: 3, DONE: 4 };

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const forgotPw = useForgotPassword();
  const verifyOtp = useVerifyOtp();
  const resetPw = useResetPassword();

  function getPasswordStrength(pw) {
    if (!pw) return null;
    const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: "Kamzor", color: "bg-red-500", width: "25%" };
    if (score === 2) return { label: "Theek hai", color: "bg-yellow-500", width: "50%" };
    if (score === 3) return { label: "Achha", color: "bg-blue-500", width: "75%" };
    return { label: "Mazboot", color: "bg-green-500", width: "100%" };
  }

  const strength = getPasswordStrength(newPassword);

  function handleSendOtp(e) {
    e.preventDefault();
    if (phone.length < 10) { toast({ title: "Valid phone number enter karein", variant: "destructive" }); return; }
    forgotPw.mutate({ phone }, {
      onSuccess: (data) => {
        if (data.dev && data.otp) setDevOtp(data.otp);
        setStep(STEPS.OTP);
        toast({ title: "OTP bheja gaya!", description: "Aapke phone par OTP aaya hai" });
      },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) { toast({ title: "6 digit OTP enter karein", variant: "destructive" }); return; }
    verifyOtp.mutate({ phone, otp }, {
      onSuccess: () => { setStep(STEPS.PASSWORD); },
      onError: (err) => toast({ title: "OTP galat hai", description: err.message, variant: "destructive" }),
    });
  }

  function handleResendOtp() {
    forgotPw.mutate({ phone }, {
      onSuccess: (data) => {
        if (data.dev && data.otp) setDevOtp(data.otp);
        setOtp("");
        toast({ title: "OTP dobara bheja gaya!" });
      },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  }

  function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) { toast({ title: "Password kam se kam 6 characters ka hona chahiye", variant: "destructive" }); return; }
    if (newPassword !== confirmPassword) { toast({ title: "Passwords match nahi ho rahe", variant: "destructive" }); return; }
    resetPw.mutate({ phone, otp, newPassword }, {
      onSuccess: () => setStep(STEPS.DONE),
      onError: (err) => toast({ title: "Reset failed", description: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="text-4xl mb-1">🔐</div>
          <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
          <CardDescription>
            {step === STEPS.PHONE && "Phone number se OTP mangwayein"}
            {step === STEPS.OTP && `OTP ${phone} par bheja gaya hai`}
            {step === STEPS.PASSWORD && "Naya password set karein"}
            {step === STEPS.DONE && "Password successfully reset ho gaya!"}
          </CardDescription>
          {step !== STEPS.DONE && (
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? "bg-primary w-8" : "bg-muted w-4"}`} />
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Step 1: Phone */}
          {step === STEPS.PHONE && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel" placeholder="9876543210" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10" required autoFocus
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={forgotPw.isPending}>
                {forgotPw.isPending ? "OTP bhej raha hai..." : "OTP Bhejo"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Wapas Login par
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>6-Digit OTP</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text" inputMode="numeric" maxLength={6} placeholder="••••••"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10 text-center text-xl tracking-widest font-bold" autoFocus required
                  />
                </div>
                {devOtp && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                    🧪 <span><strong>Dev OTP:</strong> {devOtp} (production mein SMS aayega)</span>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={verifyOtp.isPending || otp.length !== 6}>
                {verifyOtp.isPending ? "Verify ho raha hai..." : "OTP Verify Karein"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep(STEPS.PHONE)} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Wapas
                </button>
                <button type="button" onClick={handleResendOtp} disabled={forgotPw.isPending} className="text-primary hover:underline flex items-center gap-1">
                  <RefreshCw className={`w-3.5 h-3.5 ${forgotPw.isPending ? "animate-spin" : ""}`} />
                  OTP dobara bhejo
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === STEPS.PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Naya Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPw ? "text" : "password"} placeholder="Kam se kam 6 characters"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10" required autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Strength: <span className="font-medium text-foreground">{strength.label}</span></span>
                      <span>Min 6 chars, uppercase, number, symbol</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Password Confirm Karein</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirm ? "text" : "password"} placeholder="Password dobara likhein"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10" required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords match nahi ho rahe</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passwords match ho rahe hain</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={resetPw.isPending || newPassword !== confirmPassword}>
                {resetPw.isPending ? "Reset ho raha hai..." : "Password Reset Karein"}
              </Button>
            </form>
          )}

          {/* Step 4: Done */}
          {step === STEPS.DONE && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Password Reset Ho Gaya!</h3>
                <p className="text-muted-foreground text-sm mt-1">Ab aap apne naye password se login kar sakte hain</p>
              </div>
              <Button className="w-full" onClick={() => setLocation("/login")}>
                Login Karein
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
