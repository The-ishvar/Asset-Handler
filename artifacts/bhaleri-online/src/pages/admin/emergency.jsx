import { useState } from "react";
import { useListEmergency, useCreateEmergency, useDeleteEmergency } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

export default function AdminEmergency() {
  const { data: contacts, isLoading, refetch } = useListEmergency();
  const createEmergency = useCreateEmergency();
  const deleteEmergency = useDeleteEmergency();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEmergency.mutate(form, {
      onSuccess: () => { toast({ title: "Emergency contact added" }); setForm({ name: "", phone: "", description: "" }); setShowForm(false); refetch(); },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this contact?")) return;
    deleteEmergency.mutate({ id }, { onSuccess: () => { toast({ title: "Delete ho gaya" }); refetch(); }, onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><AlertTriangle className="w-7 h-7 text-red-500" /> Emergency Contacts</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Add Contact</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add Emergency Contact</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={update("name")} required placeholder="e.g. Local Hospital" /></div>
                <div className="space-y-1.5"><Label>Phone *</Label><Input value={form.phone} onChange={update("phone")} required placeholder="9876543210" /></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Input value={form.description} onChange={update("description")} placeholder="e.g. 24/7 Emergency" /></div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createEmergency.isPending}>{createEmergency.isPending ? "Adding..." : "Add Contact"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts?.map((c) => (
            <Card key={c.id} className="border-red-100 dark:border-red-950">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div><div className="font-semibold">{c.name}</div>{c.phone && <div className="text-sm font-medium text-red-600 dark:text-red-400">{c.phone}</div>}{c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}</div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)} disabled={deleteEmergency.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
          {!contacts?.length && <div className="col-span-2 text-center py-10 text-muted-foreground">No emergency contacts yet.</div>}
        </div>
      )}
    </div>
  );
}
