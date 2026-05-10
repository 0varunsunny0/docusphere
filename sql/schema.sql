-- -------------------------------------------------
-- DocuSphere – Full Database Schema (Drop & Recreate)
-- -------------------------------------------------

-- Drop existing tables if they exist (clean rebuild)
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.document_versions CASCADE;
DROP TABLE IF EXISTS public.admin_audit CASCADE;
DROP TABLE IF EXISTS public.collaborators CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- -------------------------------------------------
-- 1. Users (authentication & profile)
-- -------------------------------------------------
CREATE TABLE public.users (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    name          TEXT,
    mobile_number TEXT    UNIQUE,
    otp_code      TEXT,
    otp_expiry    TIMESTAMPTZ,
    streak        INT     DEFAULT 1,
    last_visit    TIMESTAMPTZ DEFAULT now(),
    role          TEXT    DEFAULT 'user',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------
-- 2. Documents
-- -------------------------------------------------
CREATE TABLE public.documents (
    id            TEXT    PRIMARY KEY,
    title         TEXT    NOT NULL DEFAULT 'Untitled Document',
    emoji         TEXT    DEFAULT '📄',
    excerpt       TEXT,
    content       TEXT    DEFAULT '',
    starred       BOOLEAN DEFAULT FALSE,
    shared        BOOLEAN DEFAULT FALSE,
    invite_token  TEXT    UNIQUE,
    owner_id      UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    updated_at    TIMESTAMPTZ DEFAULT now(),
    updated_by    TEXT
);

-- -------------------------------------------------
-- 3. Collaborators (many-to-many)
-- -------------------------------------------------
CREATE TABLE public.collaborators (
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (document_id, user_id)
);

-- -------------------------------------------------
-- 4. Admin audit log
-- -------------------------------------------------
CREATE TABLE public.admin_audit (
    id           SERIAL PRIMARY KEY,
    admin_id     UUID NOT NULL REFERENCES public.users(id),
    action       TEXT NOT NULL,
    target_type  TEXT NOT NULL,
    target_id    TEXT,
    performed_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------
-- 5. Document versions (history)
-- -------------------------------------------------
CREATE TABLE public.document_versions (
    id           SERIAL PRIMARY KEY,
    document_id  TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_num  INT NOT NULL,
    content      TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT now(),
    created_by   UUID REFERENCES public.users(id)
);

-- -------------------------------------------------
-- 6. Comments (threaded)
-- -------------------------------------------------
CREATE TABLE public.comments (
    id           SERIAL PRIMARY KEY,
    document_id  TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id    INT REFERENCES public.comments(id),
    content      TEXT NOT NULL,
    resolved     BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------
-- 7. Analytics (usage tracking)
-- -------------------------------------------------
CREATE TABLE public.analytics (
    id           SERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES public.users(id),
    document_id  TEXT REFERENCES public.documents(id),
    event_name   TEXT NOT NULL,
    metadata     JSONB,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------
-- Row-Level Security (RLS) Policies
-- -------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_self ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY doc_owner ON public.documents
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY doc_shared_read ON public.documents
    FOR SELECT USING (shared = TRUE AND EXISTS (
        SELECT 1 FROM public.collaborators c
        WHERE c.document_id = documents.id AND c.user_id = auth.uid()
    ));

CREATE POLICY doc_shared_update ON public.documents
    FOR UPDATE USING (shared = TRUE AND EXISTS (
        SELECT 1 FROM public.collaborators c
        WHERE c.document_id = documents.id AND c.user_id = auth.uid()
    ));

CREATE POLICY collab_view ON public.collaborators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY collab_manage ON public.collaborators
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.documents d
                WHERE d.id = collaborators.document_id AND d.owner_id = auth.uid())
    );

CREATE POLICY version_owner ON public.document_versions
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY comment_owner ON public.comments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY analytics_owner ON public.analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY analytics_insert ON public.analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);
