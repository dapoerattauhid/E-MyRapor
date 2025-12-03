export interface SchoolSettings {
  id: string;
  namaSekolah: string;
  npsn: string;
  alamat: string;
  semester: "1" | "2";
  tahunPelajaran: string;
  logoUrl?: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  telepon?: string;
  email?: string;
  website?: string;
}

export interface Student {
  id: string;
  nis: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  kelas: string;
  namaWaliKelas: string;
  fotoUrl?: string;
}

export interface Subject {
  id: string;
  nama: string;
  kode: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  nilaiAkhir: number;
  capaianKompetensi: string;
  semester: string;
  tahunPelajaran: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  semester: string;
  tahunPelajaran: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
}

export interface GradeDescriptionTemplate {
  minScore: number;
  maxScore: number;
  template: string;
}

export const defaultSubjects: Subject[] = [
  { id: "1", nama: "Pendidikan Agama dan Budi Pekerti", kode: "PAI" },
  { id: "2", nama: "Pendidikan Pancasila dan Kewarganegaraan", kode: "PPKn" },
  { id: "3", nama: "Bahasa Indonesia", kode: "BIN" },
  { id: "4", nama: "Matematika", kode: "MTK" },
  { id: "5", nama: "Bahasa Inggris", kode: "BIG" },
  { id: "6", nama: "Ilmu Pengetahuan Alam", kode: "IPA" },
  { id: "7", nama: "Ilmu Pengetahuan Sosial", kode: "IPS" },
  { id: "8", nama: "Seni Budaya", kode: "SBD" },
  { id: "9", nama: "Pendidikan Jasmani, Olahraga dan Kesehatan", kode: "PJOK" },
  { id: "10", nama: "Prakarya", kode: "PKY" },
];

export const gradeDescriptionTemplates: GradeDescriptionTemplate[] = [
  {
    minScore: 90,
    maxScore: 100,
    template: "Sangat baik dalam memahami, menerapkan, dan mengembangkan konsep {subject}. Menunjukkan penguasaan materi yang sangat memuaskan.",
  },
  {
    minScore: 80,
    maxScore: 89,
    template: "Baik dalam memahami dan menerapkan konsep {subject}. Menunjukkan kemampuan yang konsisten dalam pembelajaran.",
  },
  {
    minScore: 70,
    maxScore: 79,
    template: "Cukup baik dalam memahami konsep {subject}. Perlu meningkatkan pemahaman pada beberapa aspek tertentu.",
  },
  {
    minScore: 0,
    maxScore: 69,
    template: "Perlu bimbingan lebih lanjut dalam memahami konsep {subject}. Disarankan untuk lebih aktif dalam pembelajaran.",
  },
];

export function getGradeDescription(score: number, subjectName: string): string {
  const template = gradeDescriptionTemplates.find(
    (t) => score >= t.minScore && score <= t.maxScore
  );
  if (!template) return "";
  return template.template.replace("{subject}", subjectName);
}
