import { Link } from "wouter";
import { useListJobs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, Phone, Calendar, IndianRupee, ChevronRight, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function JobsList() {
  const { user } = useAuth();
  const { data: jobs, isLoading } = useListJobs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Jobs in Bhaleri</h1>
            <p className="text-muted-foreground">Local employment opportunities</p>
          </div>
        </div>
        {user ? (
          <Link href="/jobs/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" /> Job Post Karein
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" /> Job Post Karein
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
      ) : !jobs?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No job listings yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon for local employment opportunities.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:shadow-md cursor-pointer transition-all group hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                        {job.type && <Badge variant="secondary">{job.type}</Badge>}
                      </div>
                      {job.company && (
                        <div className="text-sm font-medium text-muted-foreground mt-0.5">{job.company}</div>
                      )}
                      {job.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" />{job.location}</span>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <IndianRupee className="w-3.5 h-3.5 shrink-0" />{job.salary}
                          </span>
                        )}
                        {job.contactPhone && (
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 shrink-0" />{job.contactPhone}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {new Date(job.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hidden md:block group-hover:underline">View & Apply</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
