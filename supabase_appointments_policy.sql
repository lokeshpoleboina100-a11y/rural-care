-- =========================================================================
-- RURALCARE SUPABASE RLS POLICIES FOR EXISTING APPOINTMENTS TABLE
-- Copy and paste ALL of the code below into Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Enable Row Level Security (RLS) on existing appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies to avoid name conflicts
DROP POLICY IF EXISTS "Patients can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow patients to insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow users to view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow users to update appointments" ON public.appointments;

-- 3. Create INSERT Policy (Allows logged-in patients & anon users to insert appointments)
CREATE POLICY "Allow patients to insert appointments"
ON public.appointments
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 4. Create SELECT Policy (Allows users to view appointments)
CREATE POLICY "Allow users to view appointments"
ON public.appointments
FOR SELECT
TO authenticated, anon
USING (true);

-- 5. Create UPDATE Policy (Allows updating appointment status)
CREATE POLICY "Allow users to update appointments"
ON public.appointments
FOR UPDATE
TO authenticated, anon
USING (true);

-- 6. Grant permissions to authenticated and anon roles
GRANT ALL ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO anon;
