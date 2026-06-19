import { useState } from "react";
import { useListShops, useCreateShop, useDeleteShop } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Store } from "lucide-react";

export default function AdminShops() {
  const { data: shops, isLoading, refetch } = useListShops();
  const createShop = useCreateShop();
  const deleteShop = useDeleteShop();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", type: "", address: "", phone: "", timing: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createShop.mutate(form, {
      onSuccess: () => { toast({ title: "Shop added" }); setForm({ name: "", type: "", address: "", phone: "", timing: "", description: "" }); setShowForm(false); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteShop.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); refetch(); }, onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Store className="w-7 h-7" /> Shops</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Add Shop</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add Shop</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Timing</Label><Input value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createShop.isPending}>{createShop.isPending ? "Adding..." : "Add Shop"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops?.map((shop) => (
            <Card key={shop.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div><div className="font-semibold">{shop.name}</div>{shop.type && <div className="text-xs text-muted-foreground">{shop.type}</div>}{shop.phone && <div className="text-sm text-muted-foreground">{shop.phone}</div>}</div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(shop.id, shop.name)} disabled={deleteShop.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
          {!shops?.length && <div className="col-span-2 text-center py-10 text-muted-foreground">No shops yet.</div>}
        </div>
      )}
    </div>
  );
}
