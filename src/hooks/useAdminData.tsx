import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'wali_kelas' | null;
}

export interface ClassAssignment {
  id: string;
  user_id: string;
  kelas: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

// Fetch all users with their roles (admin only)
export function useUsersWithRoles() {
  return useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name");
      
      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: "", // We don't have access to auth.users email directly
          full_name: profile.full_name,
          role: userRole?.role as 'admin' | 'wali_kelas' | null,
        };
      });

      return usersWithRoles;
    },
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'wali_kelas' }) => {
      // First, delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Then insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    },
  });
}

// Fetch class assignments
export function useClassAssignments() {
  return useQuery({
    queryKey: ["class-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_class_assignments")
        .select("*")
        .order("kelas");

      if (error) throw error;

      // Get profiles to show user names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name");

      const assignmentsWithNames = data.map((assignment) => {
        const profile = profiles?.find((p) => p.id === assignment.user_id);
        return {
          ...assignment,
          user_name: profile?.full_name || "Unknown",
        };
      });

      return assignmentsWithNames as ClassAssignment[];
    },
  });
}

// Add class assignment
export function useAddClassAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, kelas }: { userId: string; kelas: string }) => {
      const { error } = await supabase
        .from("teacher_class_assignments")
        .insert({ user_id: userId, kelas });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-assignments"] });
    },
  });
}

// Delete class assignment
export function useDeleteClassAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("teacher_class_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-assignments"] });
    },
  });
}

// Check if current user is admin
export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role === "admin";
    },
  });
}
