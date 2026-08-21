-- ====================================================================
-- DATABASE MIGRATION: INBOX PREFERENCES & GATEKEEPER SCHEMAS
-- Description: Adds columns to 'profiles', creates 'blocks' and 'restrictions'
--              tables with Row Level Security (RLS) policies.
-- ====================================================================

-- 1. ADD NEW PREFERENCE COLUMNS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_active_status BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS read_receipts_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gatekeeper_preference VARCHAR(30) DEFAULT 'everyone';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sound_effects_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auto_download_media BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS autoplay_audio BOOLEAN DEFAULT FALSE;

-- 2. CREATE BLOCKS TABLE FOR AUDITED ROSTER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);

-- Enable Row Level Security (RLS) on blocks
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Block Policies
CREATE POLICY "Users can view their own block records" 
    ON public.blocks FOR SELECT 
    USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users can block other accounts" 
    ON public.blocks FOR INSERT 
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock accounts" 
    ON public.blocks FOR DELETE 
    USING (auth.uid() = blocker_id);


-- 3. CREATE RESTRICTIONS TABLE FOR AUDITED ROSTER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restrictor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    restricted_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_restriction UNIQUE (restrictor_id, restricted_id)
);

-- Enable Row Level Security (RLS) on restrictions
ALTER TABLE public.restrictions ENABLE ROW LEVEL SECURITY;

-- Restriction Policies
CREATE POLICY "Users can view their own restriction records" 
    ON public.restrictions FOR SELECT 
    USING (auth.uid() = restrictor_id OR auth.uid() = restricted_id);

CREATE POLICY "Users can restrict accounts" 
    ON public.restrictions FOR INSERT 
    WITH CHECK (auth.uid() = restrictor_id);

CREATE POLICY "Users can remove restrictions" 
    ON public.restrictions FOR DELETE 
    USING (auth.uid() = restrictor_id);


-- 4. CREATE HIDDEN CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.hidden_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_hidden_conv UNIQUE (user_id, conversation_email)
);

-- Enable Row Level Security (RLS) on hidden_conversations
ALTER TABLE public.hidden_conversations ENABLE ROW LEVEL SECURITY;

-- Hidden Conversations Policies
CREATE POLICY "Users can manage their own hidden conversations" 
    ON public.hidden_conversations 
    USING (auth.uid() = user_id);
