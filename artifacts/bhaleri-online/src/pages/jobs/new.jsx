import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCreateJob } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase, MapPin, Phone, IndianRupee, Building2 } from "lucide-react";

export default function NewJob() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createJob = useCreateJob();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation2] = useState("");
  const [salary, setSalary] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [description, setDescription] = useState("");

  if (!user) { setLocation("/login"); return null; }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { toast({ title: "Job title zaroor likhein", variant: "destructive" }); return; }
    if (!contactPhone.trim()) { toast({ title: "Contact number zaroor likhein", variant: "destructive" }); return; }
    createJob.mutate(
      {
        title: title.trim(),
        company: company || undefined,
        location: location || undefined,
        salary: salary || undefined,
        contactPhone: contactPhone.trim(),
        description: description || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Job post ho gaya!" });
          setLocation("/jobs");
        },
        onError: (err) => toast({ title: "Job post nahi hua", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/jobs">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Job Post Karein</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Job Title *</Label>
              <Input placeholder="e.g. Driver, Helper, Teacher, Carpenter..." value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Company / Employer Name</Label>
              <Input placeholder="e.g. Suthar Hardware Store" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</Label>
                <Input placeholder="e.g. Bhaleri, Sikar" value={location} onChange={(e) => setLocation2(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Salary</Label>
                <Input placeholder="e.g. 8000/month" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact Number *</Label>
              <Input type="tel" placeholder="Your mobile number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                placeholder="Job ke baare mein details likhein — skills, timing, requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/jobs")}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={createJob.isPending}>
                <Briefcase className="w-4 h-4 mr-2" />
                {createJob.isPending ? "Post ho raha hai..." : "Job Post Karein"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
