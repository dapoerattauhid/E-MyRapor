import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/ui/stat-card";
import { useStudents, useGrades, useSubjects, useLockedReports, useSchoolSettings } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Users, BookOpen, FileCheck, Lock, ArrowRight, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { signOut } = useAuth();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: grades = [] } = useGrades();
  const { data: subjects = [] } = useSubjects();
  const { data: lockedReports = [] } = useLockedReports();
  const { data: schoolSettings } = useSchoolSettings();

  const totalStudents = students.length;
  const totalGrades = grades.length;
  const totalLocked = lockedReports.length;
  const completionRate = totalStudents > 0 && subjects.length > 0
    ? Math.round((totalGrades / (totalStudents * subjects.length)) * 100) 
    : 0;

  const recentStudents = students.slice(0, 5);

  if (loadingStudents) {
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
      <div className="space-y-8 animate-slide-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">
              Selamat Datang di E-Rapor
            </h1>
            <p className="mt-1 text-muted-foreground">
              {schoolSettings?.nama_sekolah || "Sistem Manajemen Rapor Sekolah"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/students">
                Kelola Siswa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Siswa"
            value={totalStudents}
            icon={Users}
            variant="primary"
            description="Siswa terdaftar"
          />
          <StatCard
            title="Nilai Diinput"
            value={totalGrades}
            icon={BookOpen}
            variant="secondary"
            description="Total nilai"
          />
          <StatCard
            title="Kelengkapan"
            value={`${completionRate}%`}
            icon={FileCheck}
            variant="success"
            description="Progress input nilai"
          />
          <StatCard
            title="Rapor Terkunci"
            value={totalLocked}
            icon={Lock}
            variant="warning"
            description="Sudah finalisasi"
          />
        </div>

        {/* Quick Actions & Recent Students */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Aksi Cepat</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:border-primary hover:shadow-card"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Pengaturan Sekolah</p>
                  <p className="text-xs text-muted-foreground">Atur profil sekolah</p>
                </div>
              </Link>
              <Link
                to="/grades"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:border-secondary hover:shadow-card"
              >
                <div className="rounded-lg bg-secondary/10 p-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Input Nilai</p>
                  <p className="text-xs text-muted-foreground">Tambah nilai siswa</p>
                </div>
              </Link>
              <Link
                to="/preview"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:border-success hover:shadow-card"
              >
                <div className="rounded-lg bg-success/10 p-2">
                  <FileCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Preview Rapor</p>
                  <p className="text-xs text-muted-foreground">Lihat hasil rapor</p>
                </div>
              </Link>
              <Link
                to="/lock"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:border-warning hover:shadow-card"
              >
                <div className="rounded-lg bg-warning/10 p-2">
                  <Lock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Kunci Rapor</p>
                  <p className="text-xs text-muted-foreground">Finalisasi rapor</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Students */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Siswa Terbaru</h2>
              <Link
                to="/students"
                className="text-sm font-medium text-primary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {student.nama_lengkap.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.nama_lengkap}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.nis} • {student.kelas}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada data siswa
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
