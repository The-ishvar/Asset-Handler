import { useListNotices } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Bell, AlertCircle, Info, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function NoticesList() {
  const { data: notices, isLoading, error } = useListNotices();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Village Notices</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load notices.</div>;
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700 hover:bg-red-200" };
      case "medium":
        return { icon: Bell, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700 hover:bg-orange-200" };
      case "low":
      default:
        return { icon: Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700 hover:bg-blue-200" };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notice Board
          </h1>
          <p className="text-muted-foreground mt-2">Important announcements and updates for residents.</p>
        </div>
      </div>

      {!notices?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No notices currently.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => {
            const config = getPriorityConfig(notice.priority || "low");
            const Icon = config.icon;
            
            return (
              <Card key={notice.id} className={`overflow-hidden border-l-4 ${config.border} border-l-${config.color.split('-')[1]}-500`}>
                <CardHeader className={`pb-2 ${config.bg}`}>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className={`text-xl flex items-center gap-2 ${config.color}`}>
                      <Icon className="w-5 h-5 shrink-0" />
                      {notice.title}
                    </CardTitle>
                    {notice.priority && (
                      <Badge className={config.badge} variant="secondary">
                        {notice.priority.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {notice.content}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 py-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Posted on {new Date(notice.createdAt).toLocaleString()}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
