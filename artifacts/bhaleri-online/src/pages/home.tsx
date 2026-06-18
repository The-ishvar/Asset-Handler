import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  School, 
  Stethoscope, 
  Store, 
  Bus, 
  ShoppingBag, 
  Briefcase, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  MapPin, 
  Info 
} from "lucide-react";

const sections = [
  { name: "Schools", path: "/schools", icon: School, color: "bg-blue-100 text-blue-600" },
  { name: "Medical", path: "/medical", icon: Stethoscope, color: "bg-red-100 text-red-600" },
  { name: "Shops", path: "/shops", icon: Store, color: "bg-green-100 text-green-600" },
  { name: "Bus", path: "/buses", icon: Bus, color: "bg-yellow-100 text-yellow-600" },
  { name: "Buy & Sell", path: "/buy-sell", icon: ShoppingBag, color: "bg-purple-100 text-purple-600" },
  { name: "Jobs", path: "/jobs", icon: Briefcase, color: "bg-indigo-100 text-indigo-600" },
  { name: "Events", path: "/events", icon: Calendar, color: "bg-pink-100 text-pink-600" },
  { name: "Notices", path: "/notices", icon: Bell, color: "bg-orange-100 text-orange-600" },
  { name: "Emergency", path: "/emergency", icon: AlertTriangle, color: "bg-red-500 text-white" },
  { name: "About", path: "/about", icon: Info, color: "bg-slate-100 text-slate-600" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="bg-primary/10 rounded-2xl p-6 md:p-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">Welcome to Bhaleri</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Your digital village portal. Find local services, connect with community, and stay updated with everything happening in Bhaleri.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <Link key={section.name} href={section.path}>
            <Card className="hover-elevate cursor-pointer border-transparent hover:border-border transition-all h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <div className={`p-4 rounded-full ${section.color}`}>
                  <section.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold">{section.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
