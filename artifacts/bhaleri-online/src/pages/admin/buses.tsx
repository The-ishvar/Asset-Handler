import { useState } from "react";
import { useListBuses, useCreateBus, useDeleteBus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

export default function AdminBuses() {
  const { data: buses, isLoading, refetch } = useListBuses();
  const createBus = useCreateBus();
  const deleteBus = useDeleteBus();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [fare, setFare] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBus.mutate(
      { data: { name, route, departureTime, fare } },
      {
        onSuccess: () => {
          toast({ title: "Bus added successfully" });
          setIsOpen(false);
          refetch();
          setName(""); setRoute(""); setDepartureTime(""); setFare("");
        },
        onError: (err) => {
          toast({ title: "Failed to add bus", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bus?")) {
      deleteBus.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Bus deleted successfully" });
          refetch();
        },
        onError: (err) => {
          toast({ title: "Failed to delete bus", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Buses Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Bus</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bus</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bus Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Input id="route" value={route} onChange={e => setRoute(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input id="departureTime" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fare">Fare</Label>
                <Input id="fare" value={fare} onChange={e => setFare(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={createBus.isPending}>
                {createBus.isPending ? "Adding..." : "Add Bus"}
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
              <TableHead>Route</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buses?.map(bus => (
              <TableRow key={bus.id}>
                <TableCell className="font-medium">{bus.name}</TableCell>
                <TableCell>{bus.route}</TableCell>
                <TableCell>{bus.departureTime}</TableCell>
                <TableCell>₹{bus.fare}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(bus.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!buses?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No buses found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
