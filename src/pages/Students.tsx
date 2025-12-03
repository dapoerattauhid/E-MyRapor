import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useStudents, useAddStudent, useUpdateStudent, useDeleteStudent, DbStudent } from "@/hooks/useSupabaseData";
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
import { toast } from "@/hooks/use-toast";
import { Search, Pencil, Trash2, UserPlus, Loader2 } from "lucide-react";

interface FormData {
  nis: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  kelas: string;
  nama_wali_kelas: string;
}

export default function Students() {
  const { data: students = [], isLoading } = useStudents();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<DbStudent | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nis: "",
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "L",
    kelas: "",
    nama_wali_kelas: "",
  });

  const kelasList = [...new Set(students.map((s) => s.kelas))];

  const filteredStudents = students.filter((student) => {
    const matchSearch =
      student.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      student.nis.includes(search);
    const matchKelas = filterKelas === "all" || student.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({
          id: editingStudent.id,
          ...formData,
        });
        toast({
          title: "Data Diperbarui",
          description: "Data siswa berhasil diperbarui.",
        });
      } else {
        await addStudent.mutateAsync(formData);
        toast({
          title: "Siswa Ditambahkan",
          description: "Data siswa baru berhasil ditambahkan.",
        });
      }
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: DbStudent) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nama_lengkap: student.nama_lengkap,
      tempat_lahir: student.tempat_lahir || "",
      tanggal_lahir: student.tanggal_lahir || "",
      jenis_kelamin: (student.jenis_kelamin as "L" | "P") || "L",
      kelas: student.kelas,
      nama_wali_kelas: student.nama_wali_kelas || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent.mutateAsync(id);
      toast({
        title: "Siswa Dihapus",
        description: "Data siswa berhasil dihapus.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      nis: "",
      nama_lengkap: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "L",
      kelas: "",
      nama_wali_kelas: "",
    });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-2xl font-bold lg:text-3xl">Data Siswa</h1>
            <p className="mt-1 text-muted-foreground">
              Kelola data siswa untuk rapor
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? "Edit Siswa" : "Tambah Siswa Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi data siswa dengan lengkap
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nis">Nomor Induk Siswa</Label>
                    <Input
                      id="nis"
                      value={formData.nis}
                      onChange={(e) =>
                        setFormData({ ...formData, nis: e.target.value })
                      }
                      placeholder="2024001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                    <Input
                      id="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_lengkap: e.target.value })
                      }
                      placeholder="Nama lengkap siswa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    <Input
                      id="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={(e) =>
                        setFormData({ ...formData, tempat_lahir: e.target.value })
                      }
                      placeholder="Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input
                      id="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggal_lahir: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                    <Select
                      value={formData.jenis_kelamin}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          jenis_kelamin: value as "L" | "P",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    <Input
                      id="kelas"
                      value={formData.kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                      placeholder="VII-A"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nama_wali_kelas">Nama Wali Kelas</Label>
                    <Input
                      id="nama_wali_kelas"
                      value={formData.nama_wali_kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_wali_kelas: e.target.value })
                      }
                      placeholder="Ibu Sri Wahyuni, S.Pd"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={addStudent.isPending || updateStudent.isPending}>
                    {(addStudent.isPending || updateStudent.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingStudent ? "Simpan Perubahan" : "Tambah Siswa"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterKelas} onValueChange={setFilterKelas}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasList.map((kelas) => (
                <SelectItem key={kelas} value={kelas}>
                  {kelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>NIS</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Tempat, Tanggal Lahir</TableHead>
                <TableHead>L/P</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.nis}</TableCell>
                    <TableCell>{student.nama_lengkap}</TableCell>
                    <TableCell>
                      {student.tempat_lahir && student.tanggal_lahir
                        ? `${student.tempat_lahir}, ${new Date(student.tanggal_lahir).toLocaleDateString("id-ID")}`
                        : "-"}
                    </TableCell>
                    <TableCell>{student.jenis_kelamin || "-"}</TableCell>
                    <TableCell>{student.kelas}</TableCell>
                    <TableCell>{student.nama_wali_kelas || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Tidak ada data siswa
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
