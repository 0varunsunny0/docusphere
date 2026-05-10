-- Seed admin user (replace password hash with your own secure hash)
INSERT INTO public.users (id, email, password_hash, name, role)
VALUES (
    gen_random_uuid(),
    'admin@gmail.com',
    crypt('123456', gen_salt('bf')),
    'Admin',
    'admin'
);
