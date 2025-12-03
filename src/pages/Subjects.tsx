import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSubjects, useAddSubject, useUpdateSubject, useDeleteSubject } from "@/hooks/useSupabaseData";
import { useIsAdmin } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookOpen, Loader2, ShieldAlert } from "lucide-react";

interface SubjectForm {
  nama: string;
  kode: string;
}

export default function Subjects() {
  const { data: subjects = [], isLoading } = useSubjects();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const addSubject = useAddSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectForm>({ nama: "", kode: "" });

  const resetForm = () => {
    setForm({ nama: "", kode: "" });
    setEditingSubject(null);
  };

  const handleOpenDialog = (subject?: { id: string; nama: string; kode: string }) => {
    if (subject) {
      setEditingSubject(subject.id);
      setForm({ nama: subject.nama, kode: subject.kode });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nama.trim() || !form.kode.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode mata pelajaran harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({ id: editingSubject, ...form });
        toast({ title: "Berhasil", description: "Mata pelajaran berhasil diperbarui" });
      } else {
        await addSubject.mutateAsync(form);
        toast({ title: "Berhasil", description: "Mata pelajaran berhasil ditambahkan" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan mata pelajaran",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject.mutateAsync(id);
      toast({ title: "Berhasil", description: "Mata pelajaran berhasil dihapus" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus mata pelajaran",
        variant: "destructive",
      });
    }
  };

  if (isLoading || isAdminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <ShieldAlert className="mb-4 h-16 w-16 text-destructive" />
          <h2 className="text-xl font-semibold">Akses Ditolak</h2>
          <p className="text-muted-foreground">Halaman ini hanya dapat diakses oleh admin</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-slide-in">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Mata Pelajaran</h1>
            <p className="mt-1 text-muted-foreground">
              Kelola daftar mata pelajaran untuk rapor
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Mapel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Mata Pelajaran</Label>
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Contoh: Matematika"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode</Label>
                  <Input
                    id="kode"
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                    placeholder="Contoh: MTK"
                    maxLength={10}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={addSubject.isPending || updateSubject.isPending}
                  >
                    {(addSubject.isPending || updateSubject.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 text-center">No</TableHead>
                <TableHead className="w-24">Kode</TableHead>
                <TableHead>Nama Mata Pelajaran</TableHead>
                <TableHead className="w-32 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Belum ada mata pelajaran</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject, index) => (
                  <TableRow key={subject.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{subject.kode}</TableCell>
                    <TableCell>{subject.nama}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Mata Pelajaran?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Semua nilai yang terkait
                                dengan mata pelajaran ini juga akan terhapus.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(subject.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}