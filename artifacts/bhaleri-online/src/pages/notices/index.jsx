import { useListNotices } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NoticesList() {
  const { data: notices, isLoading } = useListNotices();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full"><Bell className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold">Notices</h1>
          <p className="text-muted-foreground">Public announcements and notices for Bhaleri</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      ) : !notices?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No notices published yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base flex-1">{notice.title}</h3>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {notice.content && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{notice.content}</p>}
                {notice.issuedBy && <p className="text-xs text-muted-foreground mt-3 font-medium">— {notice.issuedBy}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
