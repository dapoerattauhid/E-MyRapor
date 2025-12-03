import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  useStudents, 
  useAttendance, 
  useSchoolSettings, 
  useLockedReports,
  useUpsertAttendance 
} from "@/hooks/useSupabaseData";
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
import { toast } from "@/hooks/use-toast";
import { Save, Calendar, Loader2 } from "lucide-react";

export default function Attendance() {
  const { data: students = [] } = useStudents();
  const { data: attendance = [] } = useAttendance();
  const { data: schoolSettings } = useSchoolSettings();
  const { data: lockedReports = [] } = useLockedReports();
  const upsertAttendance = useUpsertAttendance();

  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [sakit, setSakit] = useState<string>("0");
  const [izin, setIzin] = useState<string>("0");
  const [tanpaKeterangan, setTanpaKeterangan] = useState<string>("0");

  const kelasList = [...new Set(students.map((s) => s.kelas))];
  const filteredStudents = students.filter((s) => s.kelas === selectedKelas);
  const currentStudent = students.find((s) => s.id === selectedStudent);

  const isReportLocked = (studentId: string) => {
    if (!schoolSettings) return false;
    return lockedReports.some(
      (r) =>
        r.student_id === studentId &&
        r.semester === schoolSettings.semester &&
        r.tahun_pelajaran === schoolSettings.tahun_pelajaran
    );
  };

  // Load existing attendance
  useEffect(() => {
    if (selectedStudent && schoolSettings) {
      const existingAttendance = attendance.find(
        (a) =>
          a.student_id === selectedStudent &&
          a.semester === schoolSettings.semester &&
          a.tahun_pelajaran === schoolSettings.tahun_pelajaran
      );
      if (existingAttendance) {
        setSakit(existingAttendance.sakit.toString());
        setIzin(existingAttendance.izin.toString());
        setTanpaKeterangan(existingAttendance.tanpa_keterangan.toString());
      } else {
        setSakit("0");
        setIzin("0");
        setTanpaKeterangan("0");
      }
    }
  }, [selectedStudent, attendance, schoolSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolSettings) {
      toast({
        title: "Error",
        description: "Harap lengkapi pengaturan sekolah terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    if (currentStudent && isReportLocked(currentStudent.id)) {
      toast({
        title: "Rapor Terkunci",
        description: "Tidak dapat mengubah data karena rapor sudah dikunci.",
        variant: "destructive",
      });
      return;
    }

    try {
      await upsertAttendance.mutateAsync({
        student_id: selectedStudent,
        semester: schoolSettings.semester,
        tahun_pelajaran: schoolSettings.tahun_pelajaran,
        sakit: parseInt(sakit) || 0,
        izin: parseInt(izin) || 0,
        tanpa_keterangan: parseInt(tanpaKeterangan) || 0,
      });
      toast({
        title: "Data Disimpan",
        description: `Data ketidakhadiran ${currentStudent?.nama_lengkap} berhasil disimpan.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl animate-slide-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold lg:text-3xl">Input Ketidakhadiran</h1>
          <p className="mt-1 text-muted-foreground">
            Rekap kehadiran siswa selama semester
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selection */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Pilih Siswa</h2>
                <p className="text-sm text-muted-foreground">
                  Pilih kelas dan siswa untuk input ketidakhadiran
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map((kelas) => (
                      <SelectItem key={kelas} value={kelas}>
                        {kelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Siswa</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                  disabled={!selectedKelas}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih siswa" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.nama_lengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Attendance Input */}
          {selectedStudent && (
            <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Data Ketidakhadiran</h2>
                <p className="text-sm text-muted-foreground">
                  {currentStudent?.nama_lengkap} - Semester{" "}
                  {schoolSettings?.semester} {schoolSettings?.tahun_pelajaran}
                </p>
                {currentStudent && isReportLocked(currentStudent.id) && (
                  <p className="mt-2 text-sm text-warning font-medium">
                    ⚠️ Rapor siswa ini sudah dikunci
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sakit">Sakit (Hari)</Label>
                  <Input
                    id="sakit"
                    type="number"
                    min="0"
                    value={sakit}
                    onChange={(e) => setSakit(e.target.value)}
                    disabled={currentStudent && isReportLocked(currentStudent.id)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="izin">Izin (Hari)</Label>
                  <Input
                    id="izin"
                    type="number"
                    min="0"
                    value={izin}
                    onChange={(e) => setIzin(e.target.value)}
                    disabled={currentStudent && isReportLocked(currentStudent.id)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanpaKeterangan">Tanpa Keterangan (Hari)</Label>
                  <Input
                    id="tanpaKeterangan"
                    type="number"
                    min="0"
                    value={tanpaKeterangan}
                    onChange={(e) => setTanpaKeterangan(e.target.value)}
                    disabled={currentStudent && isReportLocked(currentStudent.id)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={(currentStudent && isReportLocked(currentStudent.id)) || upsertAttendance.isPending}
                >
                  {upsertAttendance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Data
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </MainLayout>
  );
}
