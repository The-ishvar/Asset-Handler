import { useState } from "react";
import { useListShops, useCreateShop, useDeleteShop } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

export default function AdminShops() {
  const { data: shops, isLoading, refetch } = useListShops();
  const createShop = useCreateShop();
  const deleteShop = useDeleteShop();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShop.mutate(
      { data: { name, location, contactNumber } },
      {
        onSuccess: () => {
          toast({ title: "Shop added successfully" });
          setIsOpen(false);
          refetch();
          setName(""); setLocation(""); setContactNumber("");
        },
        onError: (err) => {
          toast({ title: "Failed to add shop", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this shop?")) {
      deleteShop.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Shop deleted successfully" });
          refetch();
        },
        onError: (err) => {
          toast({ title: "Failed to delete shop", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shops Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Shop</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shop</DialogTitle>
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
              <Button type="submit" className="w-full" disabled={createShop.isPending}>
                {createShop.isPending ? "Adding..." : "Add Shop"}
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
            {shops?.map(shop => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.name}</TableCell>
                <TableCell>{shop.location}</TableCell>
                <TableCell>{shop.contactNumber}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(shop.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!shops?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No shops found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
