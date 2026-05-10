-- Run this in the Supabase SQL Editor

-- 1. Create a table to track user profiles (synced from auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  streak INTEGER DEFAULT 1,
  last_visit_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Turn on RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Function to handle new user signups from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create the Documents table
CREATE TABLE public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  emoji TEXT DEFAULT '📄',
  excerpt TEXT,
  content TEXT DEFAULT '', -- Text fallback, Yjs binary data will be handled via Fastify mostly
  starred BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  invite_token TEXT UNIQUE,
  owner_id  UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

-- Turn on RLS for documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Owners have full access to their documents
CREATE POLICY "Owners have full CRUD on documents" 
ON public.documents 
FOR ALL
USING (auth.uid() = owner_id);


-- 3. Create a Collaborators mapping table for shared access
CREATE TABLE public.collaborators (
  document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (document_id, user_id)
);

ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Collaborators can read the mapping
CREATE POLICY "Collaborators can view mapping" 
ON public.collaborators FOR SELECT 
USING (auth.uid() = user_id);

-- Owners can manage collaborators
CREATE POLICY "Owners can manage collaborators" 
ON public.collaborators 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = collaborators.document_id AND d.owner_id = auth.uid()
  )
);

-- Give collaborators select/update access to the document
CREATE POLICY "Collaborators can read and update shared documents" 
ON public.documents 
FOR SELECT 
USING (
  shared = true AND (
    EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.document_id = id AND c.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Collaborators can update shared documents" 
ON public.documents 
FOR UPDATE 
USING (
  shared = true AND (
    EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.document_id = id AND c.user_id = auth.uid()
    )
  )
);

-- Realtime broadcast
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table collaborators;
