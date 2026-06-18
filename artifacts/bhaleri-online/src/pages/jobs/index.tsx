import { useListJobs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Briefcase, MapPin, IndianRupee, Phone, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function JobsList() {
  const { data: jobs, isLoading, error } = useListJobs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Local Jobs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load jobs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
            <Briefcase className="w-8 h-8" />
            Local Jobs
          </h1>
          <p className="text-muted-foreground mt-2">Employment opportunities in and around Bhaleri.</p>
        </div>
      </div>

      {!jobs?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No jobs listed currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="border-l-4 border-l-indigo-500 hover-elevate transition-all flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-indigo-900">{job.title}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-1 text-green-700 font-medium">
                      <IndianRupee className="w-4 h-4" /> {job.salary}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 py-4">
                <div className="text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {job.description || "No description provided."}
                </div>
              </CardContent>
              <CardFooter className="bg-indigo-50/50 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                  <a href={`tel:${job.contactNumber}`}>
                    <Phone className="w-4 h-4 mr-2" /> Call to Apply
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
