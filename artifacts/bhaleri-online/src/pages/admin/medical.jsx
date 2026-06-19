import { useState } from "react";
import { useListMedical, useCreateMedical, useDeleteMedical } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Stethoscope } from "lucide-react";

export default function AdminMedical() {
  const { data: items, isLoading, refetch } = useListMedical();
  const createMedical = useCreateMedical();
  const deleteMedical = useDeleteMedical();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timing, setTiming] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createMedical.mutate({ name, type, address, phone, timing, description }, {
      onSuccess: () => {
        toast({ title: "Medical facility added" });
        setName(""); setType(""); setAddress(""); setPhone(""); setTiming(""); setDescription("");
        setShowForm(false); refetch();
      },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteMedical.mutate({ id }, {
      onSuccess: () => { toast({ title: "Deleted" }); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Stethoscope className="w-7 h-7" /> Medical</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Add Facility</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add Medical Facility</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2"><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Type (e.g. Hospital, Clinic, Pharmacy)</Label><Input value={type} onChange={(e) => setType(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Timing</Label><Input value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="24 hours / 9 AM - 6 PM" /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMedical.isPending}>{createMedical.isPending ? "Adding..." : "Add Facility"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items?.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  {item.type && <div className="text-xs text-muted-foreground">{item.type}</div>}
                  {item.phone && <div className="text-sm text-muted-foreground">{item.phone}</div>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id, item.name)} disabled={deleteMedical.isPending}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {!items?.length && <div className="col-span-2 text-center py-10 text-muted-foreground">No facilities yet.</div>}
        </div>
      )}
    </div>
  );
}
