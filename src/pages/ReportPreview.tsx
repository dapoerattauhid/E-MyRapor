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
import { FileText, Printer, Download, Loader2 } from "lucide-react";

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ReportPreview() {
  const { data: students = [], isLoading } = useStudents();
  const { data: grades = [] } = useGrades();
  const { data: attendance = [] } = useAttendance();
  const { data: subjects = [] } = useSubjects();
  const { data: schoolSettings } = useSchoolSettings();

  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const reportRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mengunduh PDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Tampilkan elemen untuk cetak sebelum mengambil gambar
      const reportElement = reportRef.current;
      const originalDisplay = reportElement.style.display;
      reportElement.style.display = 'block';

      // Tambahkan style sementara untuk menghasilkan PDF yang lebih baik
      const originalStyles = {
        overflow: reportElement.style.overflow,
        height: reportElement.style.height,
        maxHeight: reportElement.style.maxHeight,
      };

      reportElement.style.overflow = 'visible';
      reportElement.style.height = 'auto';
      reportElement.style.maxHeight = 'none';

      // Ambil screenshot dari elemen
      const canvas = await html2canvas(reportElement, {
        scale: 4, // Tingkatkan skala untuk kualitas lebih tinggi
        useCORS: true, // Untuk menangani masalah cross-origin
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0); // Gunakan JPEG dengan kualitas 100%
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210; // Lebar A4 dalam mm
      const pageHeight = 297; // Tinggi A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Tambahkan halaman pertama
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Tambahkan halaman-halaman berikutnya jika diperlukan
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      // Kembalikan style semula
      reportElement.style.display = originalDisplay;
      reportElement.style.overflow = originalStyles.overflow;
      reportElement.style.height = originalStyles.height;
      reportElement.style.maxHeight = originalStyles.maxHeight;

      // Simpan file PDF
      const studentName = students.find(s => s.id === selectedStudent)?.nama_lengkap || 'siswa';
      const fileName = `Rapor_${studentName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    }
  };

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

  // Debug logs
  console.log("=== ReportPreview Debug ===");
  console.log("students:", students.length, students);
  console.log("selectedKelas:", selectedKelas);
  console.log("selectedStudent:", selectedStudent);
  console.log("currentStudent:", currentStudent);
  console.log("schoolSettings:", schoolSettings);
  console.log("grades:", grades.length);
  console.log("studentGrades:", studentGrades.length, studentGrades);
  console.log("subjects:", subjects.length);
  console.log("Render condition:", selectedStudent && currentStudent);

  const handlePrint = async () => {
    // Pastikan konten rapor benar-benar dirender sebelum cetak
    await new Promise(resolve => setTimeout(resolve, 100));

    // Tambahkan event listener untuk memastikan konten siap
    const printReportElement = reportRef.current;
    if (printReportElement) {
      // Force browser untuk merender ulang elemen sebelum cetak
      printReportElement.style.visibility = 'visible';
      printReportElement.style.display = 'block';
    }

    window.print();
  };

  // Fungsi untuk membuka PDF langsung di jendela baru (untuk cetak)
  const handleOpenPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Tampilkan elemen untuk cetak sebelum mengambil gambar
      const reportElement = reportRef.current;
      const originalDisplay = reportElement.style.display;
      reportElement.style.display = 'block';

      // Tambahkan style sementara untuk menghasilkan PDF yang lebih baik
      const originalStyles = {
        overflow: reportElement.style.overflow,
        height: reportElement.style.height,
        maxHeight: reportElement.style.maxHeight,
      };

      reportElement.style.overflow = 'visible';
      reportElement.style.height = 'auto';
      reportElement.style.maxHeight = 'none';

      // Ambil screenshot dari elemen
      const canvas = await html2canvas(reportElement, {
        scale: 4, // Tingkatkan skala untuk kualitas lebih tinggi
        useCORS: true, // Untuk menangani masalah cross-origin
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0); // Gunakan JPEG dengan kualitas 100%
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210; // Lebar A4 dalam mm
      const pageHeight = 297; // Tinggi A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Tambahkan halaman pertama
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Tambahkan halaman-halaman berikutnya jika diperlukan
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      // Kembalikan style semula
      reportElement.style.display = originalDisplay;
      reportElement.style.overflow = originalStyles.overflow;
      reportElement.style.height = originalStyles.height;
      reportElement.style.maxHeight = originalStyles.maxHeight;

      // Buka PDF di jendela baru untuk dicetak
      const pdfOutput = pdf.output('datauristring');
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Preview Rapor</title>
            </head>
            <body style="margin:0; padding:0;">
              <iframe
                src="${pdfOutput}"
                style="width:100%; height:100vh; border:none;"
                onload="window.print();"
              ></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Jika gagal membuat PDF, gunakan fungsi print biasa
      window.print();
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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Preview Rapor</h1>
            <p className="mt-1 text-muted-foreground">
              Lihat preview rapor siswa sebelum dicetak
            </p>
          </div>
          {selectedStudent && (
            <>
              <Button onClick={handleOpenPDF} className="mr-2">
                <Printer className="mr-2 h-4 w-4" />
                Cetak Rapor (PDF)
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </>
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

        {/* Debug Section - TEMPORARY */}
        <div className="mb-6 rounded-xl border border-yellow-500 bg-yellow-50 p-4 text-sm no-print">
          <h4 className="font-bold text-yellow-800 mb-2">Debug Info:</h4>
          <ul className="space-y-1 text-yellow-700">
            <li>Students loaded: {students.length}</li>
            <li>Kelas list: {kelasList.join(", ") || "none"}</li>
            <li>Selected kelas: {selectedKelas || "none"}</li>
            <li>Filtered students: {filteredStudents.length}</li>
            <li>Selected student ID: {selectedStudent || "none"}</li>
            <li>Current student found: {currentStudent ? currentStudent.nama_lengkap : "NOT FOUND"}</li>
            <li>School settings: {schoolSettings ? "loaded" : "NOT LOADED"}</li>
            <li>Grades loaded: {grades.length}</li>
            <li>Student grades: {studentGrades.length}</li>
            <li>Subjects: {subjects.length}</li>
            <li>Render condition: {String(Boolean(selectedStudent && currentStudent))}</li>
          </ul>
        </div>

        {/* Report Preview */}
        {selectedStudent && currentStudent ? (

              <div
                ref={reportRef}
                className="print-report rounded-xl border border-border bg-white p-6 animate-fade-in"
                style={{ color: '#1a1a1a', backgroundColor: '#ffffff' }}
              >
                {/* Kop Rapor */}
                <div className="kop-rapor text-center mb-6" style={{paddingBottom: '10px', borderBottom: '3px double black'}}>
                  <h2 className="text-lg font-bold uppercase" style={{margin: '0 0 4px 0'}}>
                    {schoolSettings?.nama_sekolah}
                  </h2>
                  <p className="text-xs" style={{margin: '0 0 2px 0'}}>{schoolSettings?.alamat}</p>
                  <p className="text-xs" style={{margin: '0 0 2px 0'}}>
                    {schoolSettings?.telepon && `Telp: ${schoolSettings.telepon}`}
                    {schoolSettings?.email && ` | Email: ${schoolSettings.email}`}
                  </p>
                  {schoolSettings?.website && (
                    <p className="text-xs" style={{margin: '0'}}>{schoolSettings.website}</p>
                  )}
                </div>

                {/* Title */}
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold uppercase m-0">
                    Laporan Hasil Belajar Peserta Didik
                  </h3>
                  <p className="text-xs m-0">
                    Semester {schoolSettings?.semester === "1" ? "Ganjil" : "Genap"}{" "}
                    Tahun Pelajaran {schoolSettings?.tahun_pelajaran}
                  </p>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 text-sm mb-4">
                  <div className="flex mb-1">
                    <span className="w-40">Nama Peserta Didik</span>
                    <span>: {currentStudent.nama_lengkap}</span>
                  </div>
                  <div className="flex mb-1">
                    <span className="w-40">Nomor Induk</span>
                    <span>: {currentStudent.nis}</span>
                  </div>
                  <div className="flex mb-1">
                    <span className="w-40">Tempat, Tanggal Lahir</span>
                    <span>
                      : {currentStudent.tempat_lahir || "-"},{" "}
                      {currentStudent.tanggal_lahir
                        ? new Date(currentStudent.tanggal_lahir).toLocaleDateString("id-ID")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex mb-1">
                    <span className="w-40">Kelas</span>
                    <span>: {currentStudent.kelas}</span>
                  </div>
                </div>

                {/* Grades Header */}
                <h4 className="font-semibold mb-2" style={{margin: '16px 0 8px 0'}}>A. Nilai Akademik</h4>

                {/* Grades Table */}
                <table className="w-full border border-gray-300 border-collapse mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-center" style={{width: '5%'}}>No</th>
                      <th className="border border-gray-300 p-2" style={{width: '55%'}}>Mata Pelajaran</th>
                      <th className="border border-gray-300 p-2 text-center" style={{width: '15%'}}>Nilai</th>
                      <th className="border border-gray-300 p-2" style={{width: '25%'}}>Capaian Kompetensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, index) => {
                      const grade = studentGrades.find((g) => g.subject_id === subject.id);
                      return (
                        <tr key={subject.id}>
                          <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 p-2">{subject.nama}</td>
                          <td className="border border-gray-300 p-2 text-center font-medium">
                            {grade?.nilai_akhir || "-"}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {grade?.capaian_kompetensi || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Attendance */}
                <h4 className="font-semibold mb-2" style={{margin: '16px 0 8px 0'}}>B. Ketidakhadiran</h4>
                <table className="w-full border border-gray-300 border-collapse mb-8">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 w-1/4">Sakit</td>
                      <td className="border border-gray-300 p-2 w-1/4">{studentAttendance?.sakit || 0} hari</td>
                      <td className="border border-gray-300 p-2 w-1/4">Izin</td>
                      <td className="border border-gray-300 p-2 w-1/4">{studentAttendance?.izin || 0} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Tanpa Keterangan</td>
                      <td className="border border-gray-300 p-2">{studentAttendance?.tanpa_keterangan || 0} hari</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="mb-8">Mengetahui,</p>
                    <p className="mb-8">Orang Tua/Wali</p>
                    <p className="border-b border-gray-800" style={{width: '70%', margin: 'auto'}}></p>
                  </div>
                  <div className="text-center">
                    <p className="mb-1">
                      Jakarta,{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mb-8">Wali Kelas</p>
                    <p className="font-medium">{currentStudent.nama_wali_kelas || "-"}</p>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <p className="mb-2">Mengetahui,</p>
                  <p className="mb-8">Kepala Sekolah</p>
                  <p className="font-medium">{schoolSettings?.nama_kepala_sekolah}</p>
                  <p className="text-sm">NIP. {schoolSettings?.nip_kepala_sekolah}</p>
                </div>
              </div>
            ) : (
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
