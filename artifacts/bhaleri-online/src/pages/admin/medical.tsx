import { useState } from "react";
import { useListMedical, useCreateMedical, useDeleteMedical } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

export default function AdminMedical() {
  const { data: stores, isLoading, refetch } = useListMedical();
  const createMedical = useCreateMedical();
  const deleteMedical = useDeleteMedical();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMedical.mutate(
      { data: { name, location, contactNumber } },
      {
        onSuccess: () => {
          toast({ title: "Medical store added successfully" });
          setIsOpen(false);
          refetch();
          setName(""); setLocation(""); setContactNumber("");
        },
        onError: (err) => {
          toast({ title: "Failed to add medical store", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this store?")) {
      deleteMedical.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Medical store deleted successfully" });
          refetch();
        },
        onError: (err) => {
          toast({ title: "Failed to delete store", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Medical Stores Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Medical Store</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medical Store</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={createMedical.isPending}>
                {createMedical.isPending ? "Adding..." : "Add Store"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map(store => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{store.location}</TableCell>
                <TableCell>{store.contactNumber}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(store.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!stores?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No medical stores found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
