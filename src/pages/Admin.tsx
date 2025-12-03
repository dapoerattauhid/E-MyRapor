import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useUsersWithRoles,
  useUpdateUserRole,
  useClassAssignments,
  useAddClassAssignment,
  useDeleteClassAssignment,
  useIsAdmin,
  UserWithRole,
} from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, Users, Plus, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: users = [], isLoading: usersLoading } = useUsersWithRoles();
  const { data: assignments = [], isLoading: assignmentsLoading } = useClassAssignments();
  const updateRole = useUpdateUserRole();
  const addAssignment = useAddClassAssignment();
  const deleteAssignment = useDeleteClassAssignment();

  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newKelas, setNewKelas] = useState("");

  // Get teachers (wali_kelas) for assignment dropdown
  const teachers = users.filter((u) => u.role === "wali_kelas");

  const handleRoleChange = async (userId: string, role: 'admin' | 'wali_kelas') => {
    try {
      await updateRole.mutateAsync({ userId, role });
      toast({
        title: "Role Diperbarui",
        description: "Role pengguna berhasil diperbarui.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newKelas) {
      toast({
        title: "Error",
        description: "Pilih guru dan masukkan kelas.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addAssignment.mutateAsync({ userId: selectedUserId, kelas: newKelas });
      toast({
        title: "Assignment Ditambahkan",
        description: "Guru berhasil ditugaskan ke kelas.",
      });
      setIsAssignmentDialogOpen(false);
      setSelectedUserId("");
      setNewKelas("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteAssignment.mutateAsync(id);
      toast({
        title: "Assignment Dihapus",
        description: "Penugasan kelas berhasil dihapus.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isAdminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isLoading = usersLoading || assignmentsLoading;

  return (
    <MainLayout>
      <div className="animate-slide-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold lg:text-3xl">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">
            Kelola role pengguna dan penugasan kelas
          </p>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <Users className="h-4 w-4" />
              Class Assignments
            </TabsTrigger>
          </TabsList>

          {/* User Roles Tab */}
          <TabsContent value="roles">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama</TableHead>
                      <TableHead>Role Saat Ini</TableHead>
                      <TableHead>Ubah Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "Tidak ada nama"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {user.role === "admin" ? "Admin" : "Wali Kelas"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role || "wali_kelas"}
                              onValueChange={(value) =>
                                handleRoleChange(user.id, value as 'admin' | 'wali_kelas')
                              }
                              disabled={updateRole.isPending}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="wali_kelas">Wali Kelas</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Tidak ada pengguna
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Class Assignments Tab */}
          <TabsContent value="assignments">
            <div className="mb-4 flex justify-end">
              <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Penugasan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Penugasan Kelas</DialogTitle>
                    <DialogDescription>
                      Tugaskan guru wali kelas ke kelas tertentu
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAssignment} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pilih Guru</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih guru..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.full_name || "Tanpa nama"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kelas">Kelas</Label>
                      <Input
                        id="kelas"
                        value={newKelas}
                        onChange={(e) => setNewKelas(e.target.value)}
                        placeholder="Contoh: VII-A"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAssignmentDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={addAssignment.isPending}>
                        {addAssignment.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Simpan
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length > 0 ? (
                      assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.user_name}
                          </TableCell>
                          <TableCell>{assignment.kelas}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              disabled={deleteAssignment.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Belum ada penugasan kelas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
