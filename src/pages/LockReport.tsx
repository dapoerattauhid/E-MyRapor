import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  useStudents, 
  useGrades, 
  useSubjects, 
  useSchoolSettings, 
  useLockedReports,
  useLockReport,
  useUnlockReport 
} from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Lock, Unlock, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LockReport() {
  const { user } = useAuth();
  const { data: students = [], isLoading } = useStudents();
  const { data: grades = [] } = useGrades();
  const { data: subjects = [] } = useSubjects();
  const { data: schoolSettings } = useSchoolSettings();
  const { data: lockedReports = [] } = useLockedReports();
  const lockReportMutation = useLockReport();
  const unlockReportMutation = useUnlockReport();

  const [filterKelas, setFilterKelas] = useState<string>("all");

  const kelasList = [...new Set(students.map((s) => s.kelas))];
  const filteredStudents =
    filterKelas === "all"
      ? students
      : students.filter((s) => s.kelas === filterKelas);

  const isReportLocked = (studentId: string) => {
    if (!schoolSettings) return false;
    return lockedReports.some(
      (r) =>
        r.student_id === studentId &&
        r.semester === schoolSettings.semester &&
        r.tahun_pelajaran === schoolSettings.tahun_pelajaran
    );
  };

  const getCompletionStatus = (studentId: string) => {
    if (!schoolSettings || subjects.length === 0) return 0;
    const studentGrades = grades.filter(
      (g) =>
        g.student_id === studentId &&
        g.semester === schoolSettings.semester &&
        g.tahun_pelajaran === schoolSettings.tahun_pelajaran
    );
    const completion = Math.round(
      (studentGrades.length / subjects.length) * 100
    );
    return completion;
  };

  const handleLock = async (studentId: string, studentName: string) => {
    if (!schoolSettings) return;
    try {
      await lockReportMutation.mutateAsync({
        student_id: studentId,
        semester: schoolSettings.semester,
        tahun_pelajaran: schoolSettings.tahun_pelajaran,
        locked_by: user?.id || null,
      });
      toast({
        title: "Rapor Dikunci",
        description: `Rapor ${studentName} telah dikunci dan tidak dapat diubah.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnlock = async (studentId: string, studentName: string) => {
    if (!schoolSettings) return;
    try {
      await unlockReportMutation.mutateAsync({
        studentId,
        semester: schoolSettings.semester,
        tahunPelajaran: schoolSettings.tahun_pelajaran,
      });
      toast({
        title: "Rapor Dibuka",
        description: `Rapor ${studentName} telah dibuka kembali untuk diedit.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold lg:text-3xl">Kunci Rapor</h1>
          <p className="mt-1 text-muted-foreground">
            Finalisasi dan kunci rapor siswa setelah selesai input nilai
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Perhatian</p>
              <p className="text-sm text-muted-foreground">
                Setelah rapor dikunci, nilai tidak dapat diubah kecuali oleh admin.
                Pastikan semua nilai sudah benar sebelum mengunci rapor.
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="w-full md:w-64">
            <Label className="mb-2 block">Filter Kelas</Label>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
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
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-center">Kelengkapan Nilai</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const completion = getCompletionStatus(student.id);
                  const isLocked = isReportLocked(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nis}</TableCell>
                      <TableCell>{student.nama_lengkap}</TableCell>
                      <TableCell>{student.kelas}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-secondary transition-all"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {completion}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isLocked ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/20">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Terkunci
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Unlock className="mr-1 h-3 w-3" />
                            Terbuka
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isLocked ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={unlockReportMutation.isPending}>
                                <Unlock className="mr-2 h-4 w-4" />
                                Buka Kunci
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Buka Kunci Rapor?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Anda akan membuka kunci rapor {student.nama_lengkap}.
                                  Nilai dapat diubah kembali setelah dibuka.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUnlock(student.id, student.nama_lengkap)
                                  }
                                >
                                  Buka Kunci
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" disabled={lockReportMutation.isPending}>
                                <Lock className="mr-2 h-4 w-4" />
                                Kunci Rapor
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Kunci Rapor?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Anda akan mengunci rapor {student.nama_lengkap}.
                                  Setelah dikunci, nilai tidak dapat diubah lagi.
                                  <br />
                                  <br />
                                  Kelengkapan nilai saat ini: {completion}%
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleLock(student.id, student.nama_lengkap)
                                  }
                                >
                                  Kunci Rapor
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
