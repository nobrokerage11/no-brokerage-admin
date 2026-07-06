-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Moderator')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Disabled')),
    profile_image TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create property_status_history table
CREATE TABLE IF NOT EXISTS public.property_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    reason TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Alter existing tables to add columns
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rejection_remarks TEXT;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled'));

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_status_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
DROP POLICY IF EXISTS "Allow select for authenticated admins" ON public.admin_users;
CREATE POLICY "Allow select for authenticated admins" ON public.admin_users
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all for Super Admin" ON public.admin_users;
CREATE POLICY "Allow all for Super Admin" ON public.admin_users
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid() AND admin_users.role = 'Super Admin' AND admin_users.status = 'Active'
        )
    );

DROP POLICY IF EXISTS "Allow admin read access on audit logs" ON public.audit_logs;
CREATE POLICY "Allow admin read access on audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated admins to insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated admins to insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Allow admin read access on status history" ON public.property_status_history;
CREATE POLICY "Allow admin read access on status history" ON public.property_status_history
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated admins to insert status history" ON public.property_status_history;
CREATE POLICY "Allow authenticated admins to insert status history" ON public.property_status_history
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

-- 7. Seed Initial Super Admin User in auth.users and public.admin_users
-- Note: password_hash uses crypt() function with bcrypt salt. Password: 'AdminPassword123!'
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@nobrokerage.com',
    crypt('AdminPassword123!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin","role":"Super Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_users (
    id,
    full_name,
    email,
    role,
    status,
    created_at,
    updated_at
)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'Super Admin',
    'admin@nobrokerage.com',
    'Super Admin',
    'Active',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;
