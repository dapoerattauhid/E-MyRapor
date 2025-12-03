import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useStudents, useGrades, useAttendance, useSubjects, useSchoolSettings } from "@/hooks/useSupabaseData";
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
import { FileText, Printer, Loader2 } from "lucide-react";

export default function ReportPreview() {
  const { data: students = [], isLoading } = useStudents();
  const { data: grades = [] } = useGrades();
  const { data: attendance = [] } = useAttendance();
  const { data: subjects = [] } = useSubjects();
  const { data: schoolSettings } = useSchoolSettings();
  
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const reportRef = useRef<HTMLDivElement>(null);

  const kelasList = [...new Set(students.map((s) => s.kelas))];
  const filteredStudents = students.filter((s) => s.kelas === selectedKelas);
  const currentStudent = students.find((s) => s.id === selectedStudent);

  const studentGrades = grades.filter(
    (g) =>
      g.student_id === selectedStudent &&
      g.semester === schoolSettings?.semester &&
      g.tahun_pelajaran === schoolSettings?.tahun_pelajaran
  );

  const studentAttendance = attendance.find(
    (a) =>
      a.student_id === selectedStudent &&
      a.semester === schoolSettings?.semester &&
      a.tahun_pelajaran === schoolSettings?.tahun_pelajaran
  );

  const handlePrint = () => {
    window.print();
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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Preview Rapor</h1>
            <p className="mt-1 text-muted-foreground">
              Lihat preview rapor siswa sebelum dicetak
            </p>
          </div>
          {selectedStudent && (
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak Rapor
            </Button>
          )}
        </div>

        {/* Selection */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 no-print">
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

        {/* Report Preview */}
        {selectedStudent && currentStudent && (
          <div
            ref={reportRef}
            className="print-report rounded-xl border border-border bg-card p-8 animate-fade-in"
          >
            {/* Kop Rapor */}
            <div className="mb-8 border-b-2 border-foreground pb-4 text-center">
              <h2 className="text-xl font-bold uppercase">
                {schoolSettings?.nama_sekolah}
              </h2>
              <p className="text-sm">{schoolSettings?.alamat}</p>
              <p className="text-sm">
                {schoolSettings?.telepon && `Telp: ${schoolSettings.telepon}`}
                {schoolSettings?.email && ` | Email: ${schoolSettings.email}`}
              </p>
              {schoolSettings?.website && (
                <p className="text-sm">{schoolSettings.website}</p>
              )}
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold uppercase">
                Laporan Hasil Belajar Peserta Didik
              </h3>
              <p className="text-sm">
                Semester {schoolSettings?.semester === "1" ? "Ganjil" : "Genap"}{" "}
                Tahun Pelajaran {schoolSettings?.tahun_pelajaran}
              </p>
            </div>

            {/* Student Info */}
            <div className="mb-6 grid gap-2 text-sm md:grid-cols-2">
              <div className="flex">
                <span className="w-40">Nama Peserta Didik</span>
                <span>: {currentStudent.nama_lengkap}</span>
              </div>
              <div className="flex">
                <span className="w-40">Nomor Induk</span>
                <span>: {currentStudent.nis}</span>
              </div>
              <div className="flex">
                <span className="w-40">Tempat, Tanggal Lahir</span>
                <span>
                  : {currentStudent.tempat_lahir || "-"},{" "}
                  {currentStudent.tanggal_lahir 
                    ? new Date(currentStudent.tanggal_lahir).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
              <div className="flex">
                <span className="w-40">Kelas</span>
                <span>: {currentStudent.kelas}</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold">A. Nilai Akademik</h4>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center">No</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead className="w-24 text-center">Nilai</TableHead>
                    <TableHead>Capaian Kompetensi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject, index) => {
                    const grade = studentGrades.find(
                      (g) => g.subject_id === subject.id
                    );
                    return (
                      <TableRow key={subject.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{subject.nama}</TableCell>
                        <TableCell className="text-center font-medium">
                          {grade?.nilai_akhir || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {grade?.capaian_kompetensi || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Attendance */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold">B. Ketidakhadiran</h4>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                <div className="flex rounded-lg border border-border p-3">
                  <span className="flex-1">Sakit</span>
                  <span className="font-medium">{studentAttendance?.sakit || 0} hari</span>
                </div>
                <div className="flex rounded-lg border border-border p-3">
                  <span className="flex-1">Izin</span>
                  <span className="font-medium">{studentAttendance?.izin || 0} hari</span>
                </div>
                <div className="flex rounded-lg border border-border p-3">
                  <span className="flex-1">Tanpa Keterangan</span>
                  <span className="font-medium">
                    {studentAttendance?.tanpa_keterangan || 0} hari
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 grid gap-8 text-center md:grid-cols-2">
              <div>
                <p className="mb-16">Mengetahui,</p>
                <p className="mb-16">Orang Tua/Wali</p>
                <p className="border-b border-foreground"></p>
              </div>
              <div>
                <p className="mb-2">
                  Jakarta,{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="mb-16">Wali Kelas</p>
                <p className="font-medium">{currentStudent.nama_wali_kelas || "-"}</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="mb-2">Mengetahui,</p>
              <p className="mb-16">Kepala Sekolah</p>
              <p className="font-medium">{schoolSettings?.nama_kepala_sekolah}</p>
              <p className="text-sm">NIP. {schoolSettings?.nip_kepala_sekolah}</p>
            </div>
          </div>
        )}

        {!selectedStudent && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-16 no-print">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Pilih kelas dan siswa untuk melihat preview rapor
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
