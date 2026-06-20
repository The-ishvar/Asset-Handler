import { useState } from "react";
import { useListEvents, useCreateEvent, useDeleteEvent } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar } from "lucide-react";

export default function AdminEvents() {
  const { data: events, isLoading, refetch } = useListEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent.mutate(form, {
      onSuccess: () => { toast({ title: "Event added" }); setForm({ title: "", date: "", time: "", location: "", description: "" }); setShowForm(false); refetch(); },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this event?")) return;
    deleteEvent.mutate({ id }, { onSuccess: () => { toast({ title: "Delete ho gaya" }); refetch(); }, onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="w-7 h-7" /> Events</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Add Event</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2"><Label>Event Title *</Label><Input value={form.title} onChange={update("title")} required /></div>
              <div className="space-y-1.5"><Label>Date *</Label><Input type="date" value={form.date} onChange={update("date")} required /></div>
              <div className="space-y-1.5"><Label>Time</Label><Input type="time" value={form.time} onChange={update("time")} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Location</Label><Input value={form.location} onChange={update("location")} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={update("description")} rows={3} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createEvent.isPending}>{createEvent.isPending ? "Adding..." : "Add Event"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {events?.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}{event.time && ` at ${event.time}`}</div>
                  {event.location && <div className="text-xs text-muted-foreground">{event.location}</div>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)} disabled={deleteEvent.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
          {!events?.length && <div className="text-center py-10 text-muted-foreground">No events yet.</div>}
        </div>
      )}
    </div>
  );
}
