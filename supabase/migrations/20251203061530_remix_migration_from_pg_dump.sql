CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'wali_kelas'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Check if any admin exists
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;
  
  -- If no admin exists, make this user an admin, otherwise make them wali_kelas
  IF NOT admin_exists THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'wali_kelas');
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: has_class_access(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_class_access(_user_id uuid, _kelas text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT 
    has_role(_user_id, 'admin') OR
    EXISTS (
      SELECT 1 FROM public.teacher_class_assignments
      WHERE user_id = _user_id AND kelas = _kelas
    )
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    semester text NOT NULL,
    tahun_pelajaran text NOT NULL,
    sakit integer DEFAULT 0 NOT NULL,
    izin integer DEFAULT 0 NOT NULL,
    tanpa_keterangan integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    nilai_akhir numeric(5,2) NOT NULL,
    capaian_kompetensi text,
    semester text NOT NULL,
    tahun_pelajaran text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT grades_nilai_akhir_check CHECK (((nilai_akhir >= (0)::numeric) AND (nilai_akhir <= (100)::numeric)))
);


--
-- Name: locked_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locked_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    semester text NOT NULL,
    tahun_pelajaran text NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_by uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    nip text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_sekolah text NOT NULL,
    npsn text NOT NULL,
    alamat text,
    semester text DEFAULT '1'::text NOT NULL,
    tahun_pelajaran text DEFAULT '2024/2025'::text NOT NULL,
    logo_url text,
    nama_kepala_sekolah text,
    nip_kepala_sekolah text,
    telepon text,
    email text,
    website text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nis text NOT NULL,
    nama_lengkap text NOT NULL,
    tempat_lahir text,
    tanggal_lahir date,
    jenis_kelamin text,
    kelas text NOT NULL,
    nama_wali_kelas text,
    foto_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT students_jenis_kelamin_check CHECK ((jenis_kelamin = ANY (ARRAY['L'::text, 'P'::text])))
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama text NOT NULL,
    kode text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: teacher_class_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_class_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    kelas text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_student_id_semester_tahun_pelajaran_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_semester_tahun_pelajaran_key UNIQUE (student_id, semester, tahun_pelajaran);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: grades grades_student_id_subject_id_semester_tahun_pelajaran_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_subject_id_semester_tahun_pelajaran_key UNIQUE (student_id, subject_id, semester, tahun_pelajaran);


--
-- Name: locked_reports locked_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locked_reports
    ADD CONSTRAINT locked_reports_pkey PRIMARY KEY (id);


--
-- Name: locked_reports locked_reports_student_id_semester_tahun_pelajaran_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locked_reports
    ADD CONSTRAINT locked_reports_student_id_semester_tahun_pelajaran_key UNIQUE (student_id, semester, tahun_pelajaran);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: school_settings school_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_settings
    ADD CONSTRAINT school_settings_pkey PRIMARY KEY (id);


--
-- Name: students students_nis_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_nis_key UNIQUE (nis);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_kode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_kode_key UNIQUE (kode);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_class_assignments teacher_class_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_assignments
    ADD CONSTRAINT teacher_class_assignments_pkey PRIMARY KEY (id);


--
-- Name: teacher_class_assignments teacher_class_assignments_user_id_kelas_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_assignments
    ADD CONSTRAINT teacher_class_assignments_user_id_kelas_key UNIQUE (user_id, kelas);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: attendance update_attendance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: grades update_grades_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: school_settings update_school_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_school_settings_updated_at BEFORE UPDATE ON public.school_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: students update_students_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: grades grades_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: locked_reports locked_reports_locked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locked_reports
    ADD CONSTRAINT locked_reports_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES auth.users(id);


--
-- Name: locked_reports locked_reports_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locked_reports
    ADD CONSTRAINT locked_reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: teacher_class_assignments teacher_class_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_class_assignments
    ADD CONSTRAINT teacher_class_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: teacher_class_assignments Admins can manage all class assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all class assignments" ON public.teacher_class_assignments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: school_settings Admins can manage school settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage school settings" ON public.school_settings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: subjects Admins can manage subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage subjects" ON public.subjects TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage user roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: school_settings Authenticated users can view school settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view school settings" ON public.school_settings FOR SELECT TO authenticated USING (true);


--
-- Name: subjects Authenticated users can view subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);


--
-- Name: locked_reports Only admins can delete locked reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete locked reports" ON public.locked_reports FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles System can insert profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: teacher_class_assignments Teachers can view their own assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view their own assignments" ON public.teacher_class_assignments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: attendance Users can delete attendance for students in their assigned clas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete attendance for students in their assigned clas" ON public.attendance FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = attendance.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: grades Users can delete grades for students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete grades for students in their assigned classes" ON public.grades FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = grades.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: students Users can delete students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete students in their assigned classes" ON public.students FOR DELETE USING (public.has_class_access(auth.uid(), kelas));


--
-- Name: attendance Users can insert attendance for students in their assigned clas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert attendance for students in their assigned clas" ON public.attendance FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = attendance.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: grades Users can insert grades for students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert grades for students in their assigned classes" ON public.grades FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = grades.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: locked_reports Users can insert locked reports for students in their assigned ; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert locked reports for students in their assigned " ON public.locked_reports FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = locked_reports.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: students Users can insert students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert students in their assigned classes" ON public.students FOR INSERT WITH CHECK (public.has_class_access(auth.uid(), kelas));


--
-- Name: attendance Users can update attendance for students in their assigned clas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update attendance for students in their assigned clas" ON public.attendance FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = attendance.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: grades Users can update grades for students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update grades for students in their assigned classes" ON public.grades FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = grades.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: students Users can update students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update students in their assigned classes" ON public.students FOR UPDATE USING (public.has_class_access(auth.uid(), kelas));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: attendance Users can view attendance for students in their assigned classe; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view attendance for students in their assigned classe" ON public.attendance FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = attendance.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: grades Users can view grades for students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view grades for students in their assigned classes" ON public.grades FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = grades.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: locked_reports Users can view locked reports for students in their assigned cl; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view locked reports for students in their assigned cl" ON public.locked_reports FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = locked_reports.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));


--
-- Name: students Users can view students in their assigned classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view students in their assigned classes" ON public.students FOR SELECT USING (public.has_class_access(auth.uid(), kelas));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: grades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

--
-- Name: locked_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.locked_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: school_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: teacher_class_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


