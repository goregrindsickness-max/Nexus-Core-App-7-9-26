-- add_source_splits.sql
-- Creates show_settlements and source_split_payouts tables with RLS

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_role_type') THEN
        CREATE TYPE payout_role_type AS ENUM ('artist', 'promoter', 'venue', 'freelancer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status_type') THEN
        CREATE TYPE payout_status_type AS ENUM ('escrow', 'transferred');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.show_settlements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    show_id uuid NOT NULL,
    user_id uuid NOT NULL DEFAULT auth.uid(),
    gross_revenue numeric(10, 2) NOT NULL DEFAULT 0.00,
    sales_tax numeric(10, 2) NOT NULL DEFAULT 0.00,
    venue_house_cuts numeric(10, 2) NOT NULL DEFAULT 0.00,
    net_artist_pool numeric(10, 2) NOT NULL DEFAULT 0.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.source_split_payouts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    settlement_id uuid NOT NULL REFERENCES public.show_settlements(id) ON DELETE CASCADE,
    show_id uuid NOT NULL,
    user_id uuid NOT NULL DEFAULT auth.uid(),
    recipient_name text NOT NULL,
    role payout_role_type NOT NULL,
    amount numeric(10, 2) NOT NULL DEFAULT 0.00,
    status payout_status_type NOT NULL DEFAULT 'escrow',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_split_payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for show_settlements
DROP POLICY IF EXISTS "Users can view their own show settlements" ON public.show_settlements;
CREATE POLICY "Users can view their own show settlements" 
    ON public.show_settlements 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own show settlements" ON public.show_settlements;
CREATE POLICY "Users can insert their own show settlements" 
    ON public.show_settlements 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own show settlements" ON public.show_settlements;
CREATE POLICY "Users can update their own show settlements" 
    ON public.show_settlements 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create policies for source_split_payouts
DROP POLICY IF EXISTS "Users can view their own source split payouts" ON public.source_split_payouts;
CREATE POLICY "Users can view their own source split payouts" 
    ON public.source_split_payouts 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own source split payouts" ON public.source_split_payouts;
CREATE POLICY "Users can insert their own source split payouts" 
    ON public.source_split_payouts 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own source split payouts" ON public.source_split_payouts;
CREATE POLICY "Users can update their own source split payouts" 
    ON public.source_split_payouts 
    FOR UPDATE 
    USING (auth.uid() = user_id);
