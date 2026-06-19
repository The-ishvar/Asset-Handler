import { useListJobs } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, Phone, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function JobsList() {
  const { data: jobs, isLoading } = useListJobs();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full"><Briefcase className="w-7 h-7" /></div>
        <div>
          <h1 className="text-3xl font-bold">Jobs in Bhaleri</h1>
          <p className="text-muted-foreground">Local employment opportunities</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
      ) : !jobs?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No job listings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{job.title}</h3>
                      {job.type && <Badge variant="secondary">{job.type}</Badge>}
                    </div>
                    {job.company && <div className="text-sm font-medium text-muted-foreground mt-0.5">{job.company}</div>}
                    {job.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
                      {job.salary && <span className="flex items-center gap-1 text-green-600 font-medium">₹ {job.salary}</span>}
                      {job.contactPhone && <a href={`tel:${job.contactPhone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone className="w-3.5 h-3.5" /> {job.contactPhone}</a>}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
