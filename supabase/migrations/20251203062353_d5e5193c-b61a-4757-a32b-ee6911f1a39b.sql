-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing user: Insert profile and admin role for the first registered user
INSERT INTO public.profiles (id, full_name)
SELECT id, raw_user_meta_data ->> 'full_name'
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id);

-- Assign admin role to first user (since no admin exists yet)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.users.id)
LIMIT 1;