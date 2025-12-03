import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Types matching database schema
export interface DbSchoolSettings {
  id: string;
  nama_sekolah: string;
  npsn: string;
  alamat: string | null;
  semester: string;
  tahun_pelajaran: string;
  logo_url: string | null;
  nama_kepala_sekolah: string | null;
  nip_kepala_sekolah: string | null;
  telepon: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbStudent {
  id: string;
  nis: string;
  nama_lengkap: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  kelas: string;
  nama_wali_kelas: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSubject {
  id: string;
  nama: string;
  kode: string;
  created_at: string;
}

export interface DbGrade {
  id: string;
  student_id: string;
  subject_id: string;
  nilai_akhir: number;
  capaian_kompetensi: string | null;
  semester: string;
  tahun_pelajaran: string;
  created_at: string;
  updated_at: string;
}

export interface DbAttendance {
  id: string;
  student_id: string;
  semester: string;
  tahun_pelajaran: string;
  sakit: number;
  izin: number;
  tanpa_keterangan: number;
  created_at: string;
  updated_at: string;
}

export interface DbLockedReport {
  id: string;
  student_id: string;
  semester: string;
  tahun_pelajaran: string;
  locked_at: string;
  locked_by: string | null;
}

// School Settings
export function useSchoolSettings() {
  return useQuery({
    queryKey: ["schoolSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as DbSchoolSettings | null;
    },
  });
}

export function useUpsertSchoolSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<DbSchoolSettings> & { nama_sekolah: string; npsn: string }) => {
      const { data: existing } = await supabase
        .from("school_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("school_settings")
          .update(settings)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("school_settings").insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schoolSettings"] });
    },
  });
}

// Students
export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("nama_lengkap");
      if (error) throw error;
      return data as DbStudent[];
    },
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (student: Partial<DbStudent> & { nis: string; nama_lengkap: string; kelas: string }) => {
      const { error } = await supabase.from("students").insert(student);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbStudent> & { id: string }) => {
      const { error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// Subjects
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("nama");
      if (error) throw error;
      return data as DbSubject[];
    },
  });
}

export function useAddSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject: { nama: string; kode: string }) => {
      const { error } = await supabase.from("subjects").insert(subject);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; nama?: string; kode?: string }) => {
      const { error } = await supabase
        .from("subjects")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

// Grades
export function useGrades() {
  return useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grades").select("*");
      if (error) throw error;
      return data as DbGrade[];
    },
  });
}

export function useUpsertGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grade: Omit<DbGrade, "id" | "created_at" | "updated_at">) => {
      const { data: existing } = await supabase
        .from("grades")
        .select("id")
        .eq("student_id", grade.student_id)
        .eq("subject_id", grade.subject_id)
        .eq("semester", grade.semester)
        .eq("tahun_pelajaran", grade.tahun_pelajaran)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("grades")
          .update(grade)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("grades").insert(grade);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
  });
}

// Attendance
export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*");
      if (error) throw error;
      return data as DbAttendance[];
    },
  });
}

export function useUpsertAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendance: Omit<DbAttendance, "id" | "created_at" | "updated_at">) => {
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", attendance.student_id)
        .eq("semester", attendance.semester)
        .eq("tahun_pelajaran", attendance.tahun_pelajaran)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("attendance")
          .update(attendance)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").insert(attendance);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

// Locked Reports
export function useLockedReports() {
  return useQuery({
    queryKey: ["lockedReports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("locked_reports").select("*");
      if (error) throw error;
      return data as DbLockedReport[];
    },
  });
}

export function useLockReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: Omit<DbLockedReport, "id" | "locked_at">) => {
      const { error } = await supabase.from("locked_reports").insert(report);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockedReports"] });
    },
  });
}

export function useUnlockReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, semester, tahunPelajaran }: { studentId: string; semester: string; tahunPelajaran: string }) => {
      const { error } = await supabase
        .from("locked_reports")
        .delete()
        .eq("student_id", studentId)
        .eq("semester", semester)
        .eq("tahun_pelajaran", tahunPelajaran);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockedReports"] });
    },
  });
}
