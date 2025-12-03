export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          id: string
          izin: number
          sakit: number
          semester: string
          student_id: string
          tahun_pelajaran: string
          tanpa_keterangan: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          izin?: number
          sakit?: number
          semester: string
          student_id: string
          tahun_pelajaran: string
          tanpa_keterangan?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          izin?: number
          sakit?: number
          semester?: string
          student_id?: string
          tahun_pelajaran?: string
          tanpa_keterangan?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          capaian_kompetensi: string | null
          created_at: string
          id: string
          nilai_akhir: number
          semester: string
          student_id: string
          subject_id: string
          tahun_pelajaran: string
          updated_at: string
        }
        Insert: {
          capaian_kompetensi?: string | null
          created_at?: string
          id?: string
          nilai_akhir: number
          semester: string
          student_id: string
          subject_id: string
          tahun_pelajaran: string
          updated_at?: string
        }
        Update: {
          capaian_kompetensi?: string | null
          created_at?: string
          id?: string
          nilai_akhir?: number
          semester?: string
          student_id?: string
          subject_id?: string
          tahun_pelajaran?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      locked_reports: {
        Row: {
          id: string
          locked_at: string
          locked_by: string | null
          semester: string
          student_id: string
          tahun_pelajaran: string
        }
        Insert: {
          id?: string
          locked_at?: string
          locked_by?: string | null
          semester: string
          student_id: string
          tahun_pelajaran: string
        }
        Update: {
          id?: string
          locked_at?: string
          locked_by?: string | null
          semester?: string
          student_id?: string
          tahun_pelajaran?: string
        }
        Relationships: [
          {
            foreignKeyName: "locked_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          nip: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          nip?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          nip?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          nama_kepala_sekolah: string | null
          nama_sekolah: string
          nip_kepala_sekolah: string | null
          npsn: string
          semester: string
          tahun_pelajaran: string
          telepon: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nama_kepala_sekolah?: string | null
          nama_sekolah: string
          nip_kepala_sekolah?: string | null
          npsn: string
          semester?: string
          tahun_pelajaran?: string
          telepon?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nama_kepala_sekolah?: string | null
          nama_sekolah?: string
          nip_kepala_sekolah?: string | null
          npsn?: string
          semester?: string
          tahun_pelajaran?: string
          telepon?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          foto_url: string | null
          id: string
          jenis_kelamin: string | null
          kelas: string
          nama_lengkap: string
          nama_wali_kelas: string | null
          nis: string
          tanggal_lahir: string | null
          tempat_lahir: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          foto_url?: string | null
          id?: string
          jenis_kelamin?: string | null
          kelas: string
          nama_lengkap: string
          nama_wali_kelas?: string | null
          nis: string
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          foto_url?: string | null
          id?: string
          jenis_kelamin?: string | null
          kelas?: string
          nama_lengkap?: string
          nama_wali_kelas?: string | null
          nis?: string
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
        }
        Relationships: []
      }
      teacher_class_assignments: {
        Row: {
          created_at: string
          id: string
          kelas: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kelas: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kelas?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_class_access: {
        Args: { _kelas: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "wali_kelas"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "wali_kelas"],
    },
  },
} as const
