import { useState } from "react";
import { useListBuses, useCreateBus, useDeleteBus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Bus } from "lucide-react";

export default function AdminBuses() {
  const { data: buses, isLoading, refetch } = useListBuses();
  const createBus = useCreateBus();
  const deleteBus = useDeleteBus();
  const { toast } = useToast();
  const [form, setForm] = useState({ route: "", from: "", to: "", timing: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createBus.mutate(form, {
      onSuccess: () => { toast({ title: "Bus route added" }); setForm({ route: "", from: "", to: "", timing: "", description: "" }); setShowForm(false); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this bus route?")) return;
    deleteBus.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); refetch(); }, onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bus className="w-7 h-7" /> Bus Routes</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Add Route</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add Bus Route</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2"><Label>Route Name *</Label><Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} required placeholder="e.g. Bhaleri - Sikar" /></div>
              <div className="space-y-1.5"><Label>From</Label><Input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>To</Label><Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Timing</Label><Input value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })} placeholder="e.g. 7:00 AM, 12:00 PM, 5:30 PM" /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Additional Info</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createBus.isPending}>{createBus.isPending ? "Adding..." : "Add Route"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {buses?.map((bus) => (
            <Card key={bus.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div><div className="font-semibold">{bus.route}</div>{bus.timing && <div className="text-sm text-muted-foreground">{bus.timing}</div>}{bus.from && bus.to && <div className="text-xs text-muted-foreground">{bus.from} → {bus.to}</div>}</div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(bus.id)} disabled={deleteBus.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
          {!buses?.length && <div className="text-center py-10 text-muted-foreground">No bus routes yet.</div>}
        </div>
      )}
    </div>
  );
}
