import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSchoolSettings, useUpsertSchoolSettings } from "@/hooks/useSupabaseData";
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
import { Save, Building2, FileText, Loader2 } from "lucide-react";

interface FormData {
  nama_sekolah: string;
  npsn: string;
  alamat: string;
  semester: string;
  tahun_pelajaran: string;
  nama_kepala_sekolah: string;
  nip_kepala_sekolah: string;
  telepon: string;
  email: string;
  website: string;
}

export default function SchoolSettings() {
  const { data: schoolSettings, isLoading } = useSchoolSettings();
  const upsertSettings = useUpsertSchoolSettings();

  const [formData, setFormData] = useState<FormData>({
    nama_sekolah: "",
    npsn: "",
    alamat: "",
    semester: "1",
    tahun_pelajaran: "2024/2025",
    nama_kepala_sekolah: "",
    nip_kepala_sekolah: "",
    telepon: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    if (schoolSettings) {
      setFormData({
        nama_sekolah: schoolSettings.nama_sekolah,
        npsn: schoolSettings.npsn,
        alamat: schoolSettings.alamat || "",
        semester: schoolSettings.semester,
        tahun_pelajaran: schoolSettings.tahun_pelajaran,
        nama_kepala_sekolah: schoolSettings.nama_kepala_sekolah || "",
        nip_kepala_sekolah: schoolSettings.nip_kepala_sekolah || "",
        telepon: schoolSettings.telepon || "",
        email: schoolSettings.email || "",
        website: schoolSettings.website || "",
      });
    }
  }, [schoolSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertSettings.mutateAsync(formData);
      toast({
        title: "Berhasil Disimpan",
        description: "Pengaturan sekolah telah diperbarui.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      <div className="max-w-4xl animate-slide-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold lg:text-3xl">Pengaturan Sekolah</h1>
          <p className="mt-1 text-muted-foreground">
            Kelola informasi sekolah dan kop rapor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informasi Sekolah */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Informasi Sekolah</h2>
                <p className="text-sm text-muted-foreground">
                  Data dasar sekolah
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama_sekolah">Nama Sekolah</Label>
                <Input
                  id="nama_sekolah"
                  value={formData.nama_sekolah}
                  onChange={(e) => handleChange("nama_sekolah", e.target.value)}
                  placeholder="SMP Negeri 1 Jakarta"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npsn">NPSN</Label>
                <Input
                  id="npsn"
                  value={formData.npsn}
                  onChange={(e) => handleChange("npsn", e.target.value)}
                  placeholder="20100001"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat">Alamat Sekolah</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  placeholder="Jl. Pendidikan No. 1, Jakarta"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telepon">Telepon</Label>
                <Input
                  id="telepon"
                  value={formData.telepon}
                  onChange={(e) => handleChange("telepon", e.target.value)}
                  placeholder="(021) 1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="sekolah@email.sch.id"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="www.sekolah.sch.id"
                />
              </div>
            </div>
          </div>

          {/* Periode & Kepala Sekolah */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-secondary/10 p-2">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Periode & Kepala Sekolah</h2>
                <p className="text-sm text-muted-foreground">
                  Informasi untuk kop rapor
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => handleChange("semester", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                    <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun_pelajaran">Tahun Pelajaran</Label>
                <Input
                  id="tahun_pelajaran"
                  value={formData.tahun_pelajaran}
                  onChange={(e) => handleChange("tahun_pelajaran", e.target.value)}
                  placeholder="2024/2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_kepala_sekolah">Nama Kepala Sekolah</Label>
                <Input
                  id="nama_kepala_sekolah"
                  value={formData.nama_kepala_sekolah}
                  onChange={(e) => handleChange("nama_kepala_sekolah", e.target.value)}
                  placeholder="Dr. Ahmad Sudirman, M.Pd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip_kepala_sekolah">NIP Kepala Sekolah</Label>
                <Input
                  id="nip_kepala_sekolah"
                  value={formData.nip_kepala_sekolah}
                  onChange={(e) => handleChange("nip_kepala_sekolah", e.target.value)}
                  placeholder="196501011990031001"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={upsertSettings.isPending}>
              {upsertSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
