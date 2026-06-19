import { useListUsers, useDeleteUser, useUpdateUser } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, Phone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const roleBadge = {
  super_admin: <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Super Admin</Badge>,
  admin: <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Admin</Badge>,
  user: <Badge variant="secondary">User</Badge>,
};

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = useListUsers();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleDelete = (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => { toast({ title: "User deleted" }); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleRoleToggle = (user) => {
    const newRole = user.role === "admin" ? "user" : user.role === "user" ? "admin" : "user";
    updateUser.mutate({ id: user.id, data: { role: newRole } }, {
      onSuccess: () => { toast({ title: `Role updated to ${newRole}` }); refetch(); },
      onError: (err) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  if (isLoading) return <div className="text-center py-10">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <Badge variant="outline" className="text-base px-3 py-1">{users?.length ?? 0} total</Badge>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" /> {user.phone || "—"}
                  </span>
                </TableCell>
                <TableCell>{roleBadge[user.role] ?? <Badge variant="secondary">{user.role}</Badge>}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.role !== "super_admin" && (
                      <Button size="sm" variant="outline" onClick={() => handleRoleToggle(user)} disabled={updateUser.isPending} title={user.role === "admin" ? "Remove admin" : "Make admin"}>
                        <Shield className="w-3.5 h-3.5 mr-1" />
                        {user.role === "admin" ? "Demote" : "Make Admin"}
                      </Button>
                    )}
                    {user.role !== "super_admin" && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id, user.name)} disabled={deleteUser.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
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
