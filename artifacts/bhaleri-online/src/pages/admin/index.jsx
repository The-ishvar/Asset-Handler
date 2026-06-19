import { useGetDashboardStats, useGetRecentActivity } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, Store, Stethoscope, ShoppingBag, Briefcase, Calendar, Bell, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600" },
    { title: "Pending Listings", value: stats?.pendingListings || 0, icon: ShoppingBag, color: "text-red-600", alert: true },
    { title: "Total Schools", value: stats?.totalSchools || 0, icon: School, color: "text-indigo-600" },
    { title: "Total Medical", value: stats?.totalMedical || 0, icon: Stethoscope, color: "text-green-600" },
    { title: "Total Shops", value: stats?.totalShops || 0, icon: Store, color: "text-orange-600" },
    { title: "Active Jobs", value: stats?.totalJobs || 0, icon: Briefcase, color: "text-cyan-600" },
    { title: "Upcoming Events", value: stats?.upcomingEvents || 0, icon: Calendar, color: "text-pink-600" },
    { title: "Active Notices", value: stats?.activeNotices || 0, icon: Bell, color: "text-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Key metrics and recent activity for Bhaleri Online.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className={stat.alert && stat.value > 0 ? "border-red-200 bg-red-50/30 dark:border-red-900" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.alert && stat.value > 0 && <Badge variant="destructive" className="mt-1 text-xs">Needs review</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
          ) : !activity?.length ? (
            <div className="text-center py-10 text-muted-foreground">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/30">
                  <div className="bg-primary/10 text-primary rounded-full p-2 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title || item.content || "Activity"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.type && <span className="mr-2 capitalize">[{item.type}]</span>}
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
