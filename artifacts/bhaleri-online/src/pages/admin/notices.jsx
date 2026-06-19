import { useState } from "react";
import { useListNotices, useCreateNotice, useDeleteNotice } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Bell } from "lucide-react";

export default function AdminNotices() {
  const { data: notices, isLoading, refetch } = useListNotices();
  const createNotice = useCreateNotice();
  const deleteNotice = useDeleteNotice();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", content: "", issuedBy: "" });
  const [showForm, setShowForm] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    createNotice.mutate(form, {
      onSuccess: () => { toast({ title: "Notice published" }); setForm({ title: "", content: "", issuedBy: "" }); setShowForm(false); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this notice?")) return;
    deleteNotice.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); refetch(); }, onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bell className="w-7 h-7" /> Notices</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Publish Notice</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Publish Notice</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={update("title")} required /></div>
              <div className="space-y-1.5"><Label>Content</Label><Textarea value={form.content} onChange={update("content")} rows={4} /></div>
              <div className="space-y-1.5"><Label>Issued By</Label><Input value={form.issuedBy} onChange={update("issuedBy")} placeholder="e.g. Gram Panchayat, Village Sarpanch" /></div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createNotice.isPending}>{createNotice.isPending ? "Publishing..." : "Publish Notice"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {notices?.map((notice) => (
            <Card key={notice.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{notice.title}</div>
                  {notice.content && <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(notice.createdAt).toLocaleDateString("en-IN")}{notice.issuedBy && ` · ${notice.issuedBy}`}</div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(notice.id)} disabled={deleteNotice.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
          {!notices?.length && <div className="text-center py-10 text-muted-foreground">No notices yet.</div>}
        </div>
      )}
    </div>
  );
}
