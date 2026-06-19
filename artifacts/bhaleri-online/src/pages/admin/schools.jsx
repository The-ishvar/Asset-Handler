import { useState } from "react";
import { useListSchools, useCreateSchool, useDeleteSchool } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, School } from "lucide-react";

export default function AdminSchools() {
  const { data: schools, isLoading, refetch } = useListSchools();
  const createSchool = useCreateSchool();
  const deleteSchool = useDeleteSchool();
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
    createSchool.mutate({ name, type, address, phone, timing, description }, {
      onSuccess: () => {
        toast({ title: "School added" });
        setName(""); setType(""); setAddress(""); setPhone(""); setTiming(""); setDescription("");
        setShowForm(false); refetch();
      },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteSchool.mutate({ id }, {
      onSuccess: () => { toast({ title: "Deleted" }); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><School className="w-7 h-7" /> Schools</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Add School</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add New School</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2"><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Type (e.g. Government, Private)</Label><Input value={type} onChange={(e) => setType(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Timing</Label><Input value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="7:30 AM - 2:00 PM" /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createSchool.isPending}>{createSchool.isPending ? "Adding..." : "Add School"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools?.map((school) => (
            <Card key={school.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{school.name}</div>
                  {school.type && <div className="text-xs text-muted-foreground">{school.type}</div>}
                  {school.phone && <div className="text-sm text-muted-foreground">{school.phone}</div>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(school.id, school.name)} disabled={deleteSchool.isPending}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {!schools?.length && <div className="col-span-2 text-center py-10 text-muted-foreground">No schools yet. Add one above.</div>}
        </div>
      )}
    </div>
  );
}
