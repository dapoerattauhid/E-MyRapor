import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  useStudents, 
  useSubjects, 
  useGrades, 
  useSchoolSettings, 
  useLockedReports,
  useUpsertGrade 
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Save, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { getGradeDescription } from "@/types/rapor";

export default function GradeInput() {
  const { data: students = [] } = useStudents();
  const { data: subjects = [] } = useSubjects();
  const { data: grades = [] } = useGrades();
  const { data: schoolSettings } = useSchoolSettings();
  const { data: lockedReports = [] } = useLockedReports();
  const upsertGrade = useUpsertGrade();

  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [nilaiAkhir, setNilaiAkhir] = useState<string>("");
  const [capaianKompetensi, setCapaianKompetensi] = useState<string>("");

  const kelasList = [...new Set(students.map((s) => s.kelas))];
  const filteredStudents = students.filter((s) => s.kelas === selectedKelas);
  const currentStudent = students.find((s) => s.id === selectedStudent);
  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  const isReportLocked = (studentId: string) => {
    if (!schoolSettings) return false;
    return lockedReports.some(
      (r) =>
        r.student_id === studentId &&
        r.semester === schoolSettings.semester &&
        r.tahun_pelajaran === schoolSettings.tahun_pelajaran
    );
  };

  // Load existing grade when student and subject are selected
  useEffect(() => {
    if (selectedStudent && selectedSubject && schoolSettings) {
      const existingGrade = grades.find(
        (g) =>
          g.student_id === selectedStudent &&
          g.subject_id === selectedSubject &&
          g.semester === schoolSettings.semester &&
          g.tahun_pelajaran === schoolSettings.tahun_pelajaran
      );
      if (existingGrade) {
        setNilaiAkhir(existingGrade.nilai_akhir.toString());
        setCapaianKompetensi(existingGrade.capaian_kompetensi || "");
      } else {
        setNilaiAkhir("");
        setCapaianKompetensi("");
      }
    }
  }, [selectedStudent, selectedSubject, grades, schoolSettings]);

  // Auto-generate description when nilai changes
  const handleNilaiChange = (value: string) => {
    setNilaiAkhir(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100 && currentSubject) {
      const description = getGradeDescription(numValue, currentSubject.nama);
      setCapaianKompetensi(description);
    }
  };

  const handleGenerateDescription = () => {
    const numValue = parseInt(nilaiAkhir);
    if (!isNaN(numValue) && currentSubject) {
      const description = getGradeDescription(numValue, currentSubject.nama);
      setCapaianKompetensi(description);
      toast({
        title: "Deskripsi Digenerate",
        description: "Capaian kompetensi telah digenerate otomatis.",
      });
    }
  };

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
        description: "Tidak dapat mengubah nilai karena rapor sudah dikunci.",
        variant: "destructive",
      });
      return;
    }

    try {
      await upsertGrade.mutateAsync({
        student_id: selectedStudent,
        subject_id: selectedSubject,
        nilai_akhir: parseInt(nilaiAkhir),
        capaian_kompetensi: capaianKompetensi,
        semester: schoolSettings.semester,
        tahun_pelajaran: schoolSettings.tahun_pelajaran,
      });
      toast({
        title: "Nilai Disimpan",
        description: `Nilai ${currentSubject?.nama} untuk ${currentStudent?.nama_lengkap} berhasil disimpan.`,
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
      <div className="max-w-4xl animate-slide-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold lg:text-3xl">Input Nilai</h1>
          <p className="mt-1 text-muted-foreground">
            Input nilai akhir dan capaian kompetensi siswa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selection Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Pilih Siswa & Mata Pelajaran</h2>
                <p className="text-sm text-muted-foreground">
                  Pilih kelas, siswa, dan mata pelajaran yang akan dinilai
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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

              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                  disabled={!selectedStudent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Grade Input Card */}
          {selectedStudent && selectedSubject && (
            <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Input Nilai</h2>
                <p className="text-sm text-muted-foreground">
                  {currentStudent?.nama_lengkap} - {currentSubject?.nama}
                </p>
                {currentStudent && isReportLocked(currentStudent.id) && (
                  <p className="mt-2 text-sm text-warning font-medium">
                    ⚠️ Rapor siswa ini sudah dikunci
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nilaiAkhir">Nilai Akhir (0-100)</Label>
                  <Input
                    id="nilaiAkhir"
                    type="number"
                    min="0"
                    max="100"
                    value={nilaiAkhir}
                    onChange={(e) => handleNilaiChange(e.target.value)}
                    placeholder="85"
                    className="max-w-xs"
                    disabled={currentStudent && isReportLocked(currentStudent.id)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="capaianKompetensi">Capaian Kompetensi</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={!nilaiAkhir || (currentStudent && isReportLocked(currentStudent.id))}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Otomatis
                    </Button>
                  </div>
                  <Textarea
                    id="capaianKompetensi"
                    value={capaianKompetensi}
                    onChange={(e) => setCapaianKompetensi(e.target.value)}
                    placeholder="Deskripsi capaian kompetensi siswa..."
                    rows={4}
                    disabled={currentStudent && isReportLocked(currentStudent.id)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deskripsi akan digenerate otomatis berdasarkan nilai, namun dapat diedit manual
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    !nilaiAkhir ||
                    !capaianKompetensi ||
                    (currentStudent && isReportLocked(currentStudent.id)) ||
                    upsertGrade.isPending
                  }
                >
                  {upsertGrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Nilai
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </MainLayout>
  );
}
