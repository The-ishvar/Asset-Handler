import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";

const LS_REMEMBER_KEY = "bhaleri_remember_phone";

export default function Login() {
  const [phone, setPhone] = useState(() => localStorage.getItem(LS_REMEMBER_KEY) || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(LS_REMEMBER_KEY));
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      toast({ title: "Phone aur password dono chahiye", variant: "destructive" });
      return;
    }
    if (rememberMe) {
      localStorage.setItem(LS_REMEMBER_KEY, phone.trim());
    } else {
      localStorage.removeItem(LS_REMEMBER_KEY);
    }
    loginMutation.mutate(
      { phone: phone.trim(), password },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: "Welcome back!", description: `Hello, ${data.user.name}!` });
          setLocation("/");
        },
        onError: (err) => {
          toast({
            title: "Login Failed",
            description: err.message || "Phone number ya password galat hai",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="text-5xl mb-1">🏡</div>
          <CardTitle className="text-2xl font-bold">Bhaleri Online</CardTitle>
          <CardDescription>Apna phone number aur password enter karein</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  placeholder="Apna password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer"
                />
                <span className="text-muted-foreground">Mujhe yaad rakho</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                Password bhool gaye?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Login ho raha hai..." : "Login"}
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            Account nahi hai?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register karein
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
