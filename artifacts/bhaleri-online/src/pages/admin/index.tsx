import { useGetDashboardStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  School, 
  Store, 
  Stethoscope, 
  ShoppingBag, 
  Briefcase, 
  Calendar, 
  Bell,
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  if (statsLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
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
        {statCards.map((stat, i) => (
          <Card key={i} className={stat.alert && stat.value > 0 ? "border-red-200 bg-red-50/30" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activity?.length ? (
              <div className="text-center py-10 text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-3 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <Badge variant="outline" className="mt-2 text-[10px] capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
