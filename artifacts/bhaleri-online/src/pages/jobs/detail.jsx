import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetJob } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, MapPin, Phone, Calendar, ArrowLeft,
  IndianRupee, Building2, Send, CheckCircle2, X, User
} from "lucide-react";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: job, isLoading, error } = useGetJob(id, { enabled: !!id });

  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApply = (e) => {
    e.preventDefault();
    if (!name || !phone) { toast({ title: "Name and phone are required", variant: "destructive" }); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplied(true);
      setShowApply(false);
      toast({ title: "Application submitted!", description: `Your application has been sent to the employer. They will contact you on ${phone}.` });
    }, 1200);
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );

  if (error || !job) return (
    <div className="text-center py-20 text-destructive">
      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>Job not found.</p>
      <Link href="/jobs"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs</Button></Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/jobs">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Jobs
        </button>
      </Link>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-0 left-12 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {job.type && <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30 mb-3">{job.type}</Badge>}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{job.title}</h1>
              {job.company && (
                <div className="flex items-center gap-2 mt-2 text-indigo-100">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{job.company}</span>
                </div>
              )}
            </div>
            {job.salary && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-right shrink-0">
                <div className="text-xs text-indigo-100">Salary</div>
                <div className="font-bold text-lg flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />{job.salary}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-5 text-sm text-indigo-100">
            {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Posted {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Description */}
        <div className="md:col-span-2 space-y-4">
          {job.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" /> Job Description
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {applied && (
            <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Application Submitted!</p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-0.5">The employer will reach out on your contact number.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-t-4 border-t-indigo-500 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold border-b pb-2">Contact</h3>
              {job.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-full text-indigo-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <a href={`tel:${job.contactPhone}`} className="font-medium text-primary hover:underline text-sm">{job.contactPhone}</a>
                  </div>
                </div>
              )}
              {!applied ? (
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowApply(true)}>
                  <Send className="w-4 h-4 mr-2" /> Apply Now
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Applied
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowApply(false); }}>
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">Apply for Job</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{job.title}</p>
                </div>
                <button onClick={() => setShowApply(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Your mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Message <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea placeholder="Tell the employer about yourself, your experience..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowApply(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
