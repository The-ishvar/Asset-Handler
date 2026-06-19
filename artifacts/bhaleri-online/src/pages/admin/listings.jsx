import { useListListings, useApproveListing, useDeleteListing } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ExternalLink, Trash2 } from "lucide-react";
import { Link } from "wouter";

const statusBadge = {
  approved: <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Approved</Badge>,
  rejected: <Badge variant="destructive">Rejected</Badge>,
  pending: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>,
};

export default function AdminListings() {
  const { data: listings, isLoading, refetch } = useListListings({});
  const approveListing = useApproveListing();
  const deleteListing = useDeleteListing();
  const { toast } = useToast();

  const handleApproval = (id, status) => {
    approveListing.mutate({ id, data: { status } }, {
      onSuccess: () => { toast({ title: `Listing ${status}` }); refetch(); },
      onError: (err) => toast({ title: "Action failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this listing?")) return;
    deleteListing.mutate({ id }, {
      onSuccess: () => { toast({ title: "Listing deleted" }); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  if (isLoading) return <div className="text-center py-10">Loading listings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Listings Approval</h1>
        <Badge variant="outline" className="text-base px-3 py-1">{listings?.filter((l) => l.status === "pending").length ?? 0} pending</Badge>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {listing.photoUrl && <img src={listing.photoUrl} alt={listing.title} className="w-10 h-10 rounded object-cover bg-muted" />}
                    <div>
                      <div className="font-medium line-clamp-1">{listing.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(listing.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{listing.userName || "—"}</TableCell>
                <TableCell className="font-medium">₹{Number(listing.price).toLocaleString("en-IN")}</TableCell>
                <TableCell>{statusBadge[listing.status] ?? statusBadge.pending}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/buy-sell/${listing.id}`} target="_blank"><Button size="sm" variant="ghost"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                    {listing.status !== "approved" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproval(listing.id, "approved")} disabled={approveListing.isPending}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {listing.status !== "rejected" && listing.status !== "approved" && (
                      <Button size="sm" variant="destructive" onClick={() => handleApproval(listing.id, "rejected")} disabled={approveListing.isPending}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(listing.id)} disabled={deleteListing.isPending}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
