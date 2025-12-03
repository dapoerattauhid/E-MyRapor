import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  FileText,
  Lock,
  GraduationCap,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Settings, label: "Pengaturan Sekolah", path: "/settings" },
  { icon: Users, label: "Data Siswa", path: "/students" },
  { icon: BookOpen, label: "Mata Pelajaran", path: "/subjects" },
  { icon: ClipboardList, label: "Input Nilai", path: "/grades" },
  { icon: Calendar, label: "Ketidakhadiran", path: "/attendance" },
  { icon: FileText, label: "Preview Rapor", path: "/preview" },
  { icon: Lock, label: "Kunci Rapor", path: "/lock" },
  { icon: Shield, label: "Admin", path: "/admin" },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const roleLabel = userRole?.role === "admin" ? "Administrator" : "Wali Kelas";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">E-Rapor</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistem Manajemen Rapor</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-5 w-5 text-sidebar-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/60">Semester</p>
            <p className="text-sm font-semibold text-sidebar-foreground">
              Ganjil 2024/2025
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
