import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useFeatures } from "@/lib/features";
import { useUpdateFeatures } from "@/lib/api";
import { Zap, AlertCircle, ArrowLeft } from "lucide-react";

const FEATURE_META = {
  posts:         { label: "Posts",              description: "Community posts feed",               category: "Social" },
  shops:         { label: "Shops",              description: "Local shops directory & My Shop",    category: "Commerce" },
  autoBooking:   { label: "Auto Booking",       description: "Auto rickshaw booking service",      category: "Bookings" },
  busBooking:    { label: "Bus Booking",        description: "Bus schedule & seat booking",        category: "Bookings" },
  medical:       { label: "Medical",            description: "Medical stores & appointments",      category: "Services" },
  schools:       { label: "Schools",            description: "School directory & details",         category: "Services" },
  reels:         { label: "Reels",              description: "Short video reels",                  category: "Social" },
  stories:       { label: "Stories (24hr)",     description: "24-hour photo stories",              category: "Social" },
  marketplace:   { label: "Marketplace",        description: "Buy & Sell listings + Cart",         category: "Commerce" },
  map:           { label: "Village Map",        description: "Interactive village map",             category: "Services" },
  emergency:     { label: "Emergency",          description: "Emergency contacts & numbers",       category: "Services" },
  jobs:          { label: "Jobs",               description: "Job listings & applications",        category: "Services" },
  events:        { label: "Events",             description: "Community events",                   category: "Community" },
  notices:       { label: "Notices",            description: "Important official notices",         category: "Community" },
  snaps:         { label: "Snaps",              description: "Photo snaps between users",          category: "Social" },
  messages:      { label: "Messages",           description: "Direct messaging between users",     category: "Social" },
  notifications: { label: "Notifications",      description: "User notification center",           category: "Social" },
  bookEvent:     { label: "Book Event",         description: "Event ticket booking",               category: "Bookings" },
  about:         { label: "About Page",         description: "About Bhaleri Online page",          category: "Other" },
  provider:      { label: "Provider Dashboard", description: "Service provider dashboard",         category: "Other" },
};

const CATEGORIES = ["Social", "Commerce", "Bookings", "Services", "Community", "Other"];

export default function AdminFeatures() {
  const { user } = useAuth();
  const { features, refetch } = useFeatures();
  const updateFeatures = useUpdateFeatures();
  const [pending, setPending] = useState({});

  if (user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-14 h-14 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Super Admin Only</h2>
          <p className="text-muted-foreground text-sm">
            Only Super Admin can manage feature toggles.
          </p>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleToggle = async (key, value) => {
    setPending((p) => ({ ...p, [key]: true }));
    try {
      await updateFeatures.mutateAsync({ [key]: value });
      await refetch();
    } finally {
      setPending((p) => ({ ...p, [key]: false }));
    }
  };

  const enabledCount = Object.values(features).filter(Boolean).length;
  const totalCount = Object.keys(FEATURE_META).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="w-7 h-7 text-yellow-500" /> Feature Toggles
        </h1>
        <p className="text-muted-foreground mt-1">
          Enable or disable features instantly. Changes apply immediately — no redeployment needed.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="default">{enabledCount} enabled</Badge>
          <Badge variant="secondary">{totalCount - enabledCount} disabled</Badge>
        </div>
      </div>

      {CATEGORIES.map((category) => {
        const categoryFeatures = Object.entries(FEATURE_META).filter(
          ([, meta]) => meta.category === category
        );

        return (
          <div key={category}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryFeatures.map(([key, meta]) => {
                const enabled = features[key] !== false;
                const loading = !!pending[key];

                return (
                  <Card
                    key={key}
                    className={`transition-opacity ${enabled ? "" : "opacity-60"}`}
                  >
                    <CardContent className="flex items-center justify-between p-4 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{meta.label}</span>
                          <Badge
                            variant={enabled ? "default" : "secondary"}
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {enabled ? "ON" : "OFF"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{meta.description}</div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(v) => handleToggle(key, v)}
                        disabled={loading}
                        aria-label={`Toggle ${meta.label}`}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
