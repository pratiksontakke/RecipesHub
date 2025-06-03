# Yummy Page - Database Setup Guide

## Overview
This guide provides the complete SQL setup for the Yummy Page recipe sharing application. Execute these commands in your Supabase SQL Editor to set up a fresh database.

## Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Update `src/integrations/supabase/client.ts` with your project URL and anon key
- Update `supabase/config.toml` with your project_id

## Setup Instructions

### Step 1: Core Tables Setup
Execute this in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 1,
  prep_time INTEGER,
  cook_time INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  featured_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_steps table
CREATE TABLE public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  timer_minutes INTEGER,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_collaborators table
CREATE TABLE public.recipe_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_email TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);
```

### Step 2: Enable Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_collaborators ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create Security Functions
```sql
-- Create security definer functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role_for_recipe(recipe_uuid UUID)
RETURNS TEXT AS $$
  SELECT rc.role FROM public.recipe_collaborators rc
  WHERE rc.recipe_id = recipe_uuid 
  AND rc.user_id = auth.uid()
  AND rc.status = 'accepted'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_recipe_owner(recipe_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_uuid 
    AND r.user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

### Step 4: Create RLS Policies
```sql
-- Profiles policies
CREATE POLICY "Users can view all public profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Users can view their own recipes and public recipes" 
  ON public.recipes 
  FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR is_public = true
    OR public.get_current_user_role_for_recipe(id) IS NOT NULL
  );

CREATE POLICY "Users can create their own recipes" 
  ON public.recipes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
  ON public.recipes 
  FOR UPDATE 
  USING (
    user_id = auth.uid()
    OR public.get_current_user_role_for_recipe(id) = 'editor'
  );

CREATE POLICY "Users can delete their own recipes" 
  ON public.recipes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Ingredients policies
CREATE POLICY "Users can view ingredients for accessible recipes" 
  ON public.ingredients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = ingredients.recipe_id 
      AND (recipes.user_id = auth.uid() OR recipes.is_public = true)
    )
  );

CREATE POLICY "Users can manage ingredients for their recipes" 
  ON public.ingredients 
  FOR ALL 
  USING (
    public.is_recipe_owner(recipe_id) = true
    OR public.get_current_user_role_for_recipe(recipe_id) = 'editor'
  )
  WITH CHECK (
    public.is_recipe_owner(recipe_id) = true
    OR public.get_current_user_role_for_recipe(recipe_id) = 'editor'
  );

-- Recipe steps policies
CREATE POLICY "Users can view steps for accessible recipes" 
  ON public.recipe_steps 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = recipe_steps.recipe_id 
      AND (recipes.user_id = auth.uid() OR recipes.is_public = true)
    )
  );

CREATE POLICY "Users can manage steps for their recipes" 
  ON public.recipe_steps 
  FOR ALL 
  USING (
    public.is_recipe_owner(recipe_id) = true
    OR public.get_current_user_role_for_recipe(recipe_id) = 'editor'
  )
  WITH CHECK (
    public.is_recipe_owner(recipe_id) = true
    OR public.get_current_user_role_for_recipe(recipe_id) = 'editor'
  );

-- Recipe collaborators policies
CREATE POLICY "Users can view collaborators for accessible recipes" 
  ON public.recipe_collaborators 
  FOR SELECT 
  USING (
    -- Recipe owner can see all collaborators
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = recipe_collaborators.recipe_id 
      AND recipes.user_id = auth.uid()
    )
    -- Invited user can see their own invitation
    OR user_id = auth.uid()
    -- For public recipes, anyone can see accepted collaborators
    OR (
      EXISTS (
        SELECT 1 FROM public.recipes 
        WHERE recipes.id = recipe_collaborators.recipe_id 
        AND recipes.is_public = true
      ) 
      AND status = 'accepted'
    )
  );

CREATE POLICY "Recipe owners can manage collaborators" 
  ON public.recipe_collaborators 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = recipe_collaborators.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = recipe_collaborators.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own collaboration status" 
  ON public.recipe_collaborators 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Step 5: Create Triggers and Functions
```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create auto-profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 6: Add Foreign Key Constraints
```sql
-- Add foreign key relationships
ALTER TABLE public.recipe_collaborators 
ADD CONSTRAINT fk_recipe_collaborators_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.recipes 
ADD CONSTRAINT fk_recipes_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

### Step 7: Create Storage Buckets
```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create recipe-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recipe-media', 'recipe-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);
```

### Step 8: Storage Policies
```sql
-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for recipe-media
CREATE POLICY "Anyone can view recipe media" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-media');
CREATE POLICY "Authenticated users can upload recipe media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own recipe media" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own recipe media" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 9: Create Indexes for Performance
```sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recipe_collaborators_status ON public.recipe_collaborators(status);
CREATE INDEX IF NOT EXISTS idx_recipe_collaborators_email ON public.recipe_collaborators(invited_email);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);
```

## Post-Setup Configuration

### Supabase Dashboard Settings
1. **Authentication > URL Configuration:**
   - Set Site URL to your app URL
   - Add redirect URLs for your domains

2. **Storage:**
   - Verify both `avatars` and `recipe-media` buckets exist
   - Check bucket policies are active

### Code Files to Update
- `src/integrations/supabase/client.ts` - Update SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY
- `supabase/config.toml` - Update project_id

## Quick Setup (All-in-One)
Copy and paste this entire block in your Supabase SQL Editor for complete setup:

```sql
-- COMPLETE YUMMY PAGE DATABASE SETUP
-- Execute this entire block in Supabase SQL Editor

-- Step 1: Create all tables
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 1,
  prep_time INTEGER,
  cook_time INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  featured_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  timer_minutes INTEGER,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.recipe_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_email TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Step 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_collaborators ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security functions
CREATE OR REPLACE FUNCTION public.get_current_user_role_for_recipe(recipe_uuid UUID)
RETURNS TEXT AS $$
  SELECT rc.role FROM public.recipe_collaborators rc
  WHERE rc.recipe_id = recipe_uuid 
  AND rc.user_id = auth.uid()
  AND rc.status = 'accepted'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_recipe_owner(recipe_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_uuid 
    AND r.user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Step 4: Create all RLS policies
CREATE POLICY "Users can view all public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own recipes and public recipes" ON public.recipes FOR SELECT USING (user_id = auth.uid() OR is_public = true OR public.get_current_user_role_for_recipe(id) IS NOT NULL);
CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (user_id = auth.uid() OR public.get_current_user_role_for_recipe(id) = 'editor');
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view ingredients for accessible recipes" ON public.ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = ingredients.recipe_id AND (recipes.user_id = auth.uid() OR recipes.is_public = true)));
CREATE POLICY "Users can manage ingredients for their recipes" ON public.ingredients FOR ALL USING (public.is_recipe_owner(recipe_id) = true OR public.get_current_user_role_for_recipe(recipe_id) = 'editor') WITH CHECK (public.is_recipe_owner(recipe_id) = true OR public.get_current_user_role_for_recipe(recipe_id) = 'editor');

CREATE POLICY "Users can view steps for accessible recipes" ON public.recipe_steps FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_steps.recipe_id AND (recipes.user_id = auth.uid() OR recipes.is_public = true)));
CREATE POLICY "Users can manage steps for their recipes" ON public.recipe_steps FOR ALL USING (public.is_recipe_owner(recipe_id) = true OR public.get_current_user_role_for_recipe(recipe_id) = 'editor') WITH CHECK (public.is_recipe_owner(recipe_id) = true OR public.get_current_user_role_for_recipe(recipe_id) = 'editor');

CREATE POLICY "Users can view collaborators for accessible recipes" ON public.recipe_collaborators FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_collaborators.recipe_id AND recipes.user_id = auth.uid()) OR user_id = auth.uid() OR (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_collaborators.recipe_id AND recipes.is_public = true) AND status = 'accepted'));
CREATE POLICY "Recipe owners can manage collaborators" ON public.recipe_collaborators FOR ALL USING (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_collaborators.recipe_id AND recipes.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE recipes.id = recipe_collaborators.recipe_id AND recipes.user_id = auth.uid()));
CREATE POLICY "Users can update their own collaboration status" ON public.recipe_collaborators FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Step 5: Create triggers and functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN INSERT INTO public.profiles (id, email, full_name) VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name'); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Add foreign keys
ALTER TABLE public.recipe_collaborators ADD CONSTRAINT fk_recipe_collaborators_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.recipes ADD CONSTRAINT fk_recipes_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 7: Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('recipe-media', 'recipe-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);

-- Step 8: Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view recipe media" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-media');
CREATE POLICY "Authenticated users can upload recipe media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own recipe media" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own recipe media" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Step 9: Performance indexes
CREATE INDEX IF NOT EXISTS idx_recipe_collaborators_status ON public.recipe_collaborators(status);
CREATE INDEX IF NOT EXISTS idx_recipe_collaborators_email ON public.recipe_collaborators(invited_email);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);
```

## Troubleshooting

### Common Issues:
1. **Foreign key errors**: Make sure auth.users table exists
2. **RLS errors**: Ensure all policies are created correctly
3. **Storage errors**: Check bucket creation and policies

### Verification Queries:
```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## Done!
Your Yummy Page database is now fully configured and ready for use!