import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Phone, User, MapPin, Lock } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [village, setVillage] = useState("Bhaleri");
  const [bio, setBio] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  function getStrength(pw) {
    if (!pw) return null;
    const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    if (score <= 1) return { label: "Kamzor", color: "bg-red-500", width: "25%" };
    if (score === 2) return { label: "Theek", color: "bg-yellow-500", width: "50%" };
    if (score === 3) return { label: "Achha", color: "bg-blue-500", width: "75%" };
    return { label: "Mazboot", color: "bg-green-500", width: "100%" };
  }

  const strength = getStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length < 10) { toast({ title: "Valid phone number enter karein", variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: "Password kam se kam 6 characters ka hona chahiye", variant: "destructive" }); return; }
    registerMutation.mutate(
      { name: name.trim(), phone: phone.trim(), password, village: village.trim(), bio: bio.trim() || undefined },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: `Welcome, ${data.user.name}! 🎉`, description: "Bhaleri Online mein aapka swagat hai!" });
          setLocation("/");
        },
        onError: (err) => {
          toast({
            title: "Registration Failed",
            description: err.message || "Kuch gadbad ho gayi. Dobara try karein.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="text-5xl mb-1">🏡</div>
          <CardTitle className="text-2xl font-bold">Bhaleri Online Join Karein</CardTitle>
          <CardDescription>Community se judne ke liye account banayein</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Poora Naam *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone" type="tel" placeholder="9876543210"
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="village">Gaon / Sheher</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="village" placeholder="Bhaleri" value={village} onChange={(e) => setVillage(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio" placeholder="Apne baare mein kuch likhein..." value={bio}
                onChange={(e) => setBio(e.target.value)} rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password" type={showPassword ? "text" : "password"} placeholder="Kam se kam 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10" required minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="space-y-0.5">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium text-foreground">{strength.label}</span></p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Account ban raha hai..." : "Register Karein"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            Pehle se account hai?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Login karein</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
