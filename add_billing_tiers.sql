-- add_billing_tiers.sql
-- Safely declares subscription_tier_v1 ENUM if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier_v1') THEN
        CREATE TYPE subscription_tier_v1 AS ENUM ('free_for_life', 'power_user_pro', 'enterprise_circuit');
    END IF;
END$$;

-- Alter profiles table to inject core billing and tier configuration columns safely
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS sub_tier subscription_tier_v1 NOT NULL DEFAULT 'free_for_life';

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id text NULL;

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive';

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz NULL;

-- Provision a high-velocity index on the sub_tier column to accelerate queries and Row-Level Security evaluations
CREATE INDEX IF NOT EXISTS idx_profiles_sub_tier ON public.profiles (sub_tier);

-- Commentary for application maintainers
COMMENT ON COLUMN public.profiles.sub_tier IS 'Subscription tier for access-control validation: free_for_life, power_user_pro, or enterprise_circuit';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Associated Stripe Customer ID for payment orchestration';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe subscription status state (active, trailing_trial, past_due, inactive)';
COMMENT ON COLUMN public.profiles.current_period_end IS 'End timestamp for the current active subscription billing cycle';
