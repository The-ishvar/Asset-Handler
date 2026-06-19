import { useState } from "react";
import { useListJobs, useCreateJob, useDeleteJob } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Briefcase } from "lucide-react";

export default function AdminJobs() {
  const { data: jobs, isLoading, refetch } = useListJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", company: "", type: "", location: "", salary: "", contactPhone: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    createJob.mutate(form, {
      onSuccess: () => { toast({ title: "Job posted" }); setForm({ title: "", company: "", type: "", location: "", salary: "", contactPhone: "", description: "" }); setShowForm(false); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this job?")) return;
    deleteJob.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); refetch(); }, onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Briefcase className="w-7 h-7" /> Jobs</h1>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Post Job</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Post Job</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2"><Label>Job Title *</Label><Input value={form.title} onChange={update("title")} required /></div>
              <div className="space-y-1.5"><Label>Company / Employer</Label><Input value={form.company} onChange={update("company")} /></div>
              <div className="space-y-1.5"><Label>Type (Full-time / Part-time)</Label><Input value={form.type} onChange={update("type")} /></div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={update("location")} /></div>
              <div className="space-y-1.5"><Label>Salary (₹)</Label><Input value={form.salary} onChange={update("salary")} /></div>
              <div className="space-y-1.5"><Label>Contact Phone</Label><Input value={form.contactPhone} onChange={update("contactPhone")} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={update("description")} rows={3} /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createJob.isPending}>{createJob.isPending ? "Posting..." : "Post Job"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {isLoading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {jobs?.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div><div className="font-semibold">{job.title}</div>{job.company && <div className="text-sm text-muted-foreground">{job.company}</div>}{job.salary && <div className="text-xs text-green-600 font-medium">₹ {job.salary}</div>}</div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)} disabled={deleteJob.isPending}><Trash2 className="w-3.5 h-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
          {!jobs?.length && <div className="text-center py-10 text-muted-foreground">No jobs posted yet.</div>}
        </div>
      )}
    </div>
  );
}
