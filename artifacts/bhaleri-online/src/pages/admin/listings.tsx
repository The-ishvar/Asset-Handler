import { useListListings, useApproveListing, ListingApprovalStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ExternalLink } from "lucide-react";

export default function AdminListings() {
  // Pass empty object to get all listings including pending
  const { data: listings, isLoading, refetch } = useListListings({});
  const approveListing = useApproveListing();
  const { toast } = useToast();

  const handleApproval = (id: number, status: "approved" | "rejected") => {
    approveListing.mutate(
      { id, data: { status: status as ListingApprovalStatus } }, 
      {
        onSuccess: () => {
          toast({ title: `Listing ${status} successfully` });
          refetch();
        },
        onError: (err) => {
          toast({ title: "Action failed", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Listings Approval</h1>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map(listing => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{listing.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{listing.description}</span>
                  </div>
                </TableCell>
                <TableCell>{listing.userName}</TableCell>
                <TableCell>₹{listing.price}</TableCell>
                <TableCell>
                  {listing.status === 'pending' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                  {listing.status === 'approved' && <Badge className="bg-green-100 text-green-800">Approved</Badge>}
                  {listing.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  {listing.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleApproval(listing.id, "approved")} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleApproval(listing.id, "rejected")} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {listing.status !== 'pending' && (
                    <Button variant="ghost" size="sm" disabled>Processed</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!listings?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No listings found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
