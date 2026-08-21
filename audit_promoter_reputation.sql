-- =========================================================================
-- NEXUS METRIC ENGINE: AUTOMATED PROMOTER REPUTATION AUDIT & FLAGGING TRIGGER
-- TARGET: public.user_reviews
-- PURPOSE: Enforce bilateral protocol accountability across independent circuits (620px constraint)
-- =========================================================================

-- First, ensure user_reviews table has explicit structured infraction/target columns for performance optimization
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS infraction_type TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS target_promoter_id TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS venue_id TEXT;

CREATE OR REPLACE FUNCTION public.audit_promoter_reputation_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
    critical_count INTEGER;
    target_id TEXT;
BEGIN
    -- Determine the target promoter/venue ID (supporting target_promoter_id, venue_id, or "group" fallback)
    target_id := COALESCE(NEW.target_promoter_id, NEW.venue_id, NEW."group");
    
    IF target_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Intercept and inspect critical default flag indicators on INSERT/UPDATE
    IF (
        NEW.infraction_type IN ('SHORTED_PAYMENT', 'CONTRACT_DEFAULT', 'GUARANTEE_SHORTED', 'BACKLINE_DEFAULT', 'HOSPITALITY_DEFAULT', 'UNSAFE_ENVIRONMENT')
        OR NEW.text ILIKE '%SHORTED_PAYMENT%'
        OR NEW.text ILIKE '%CONTRACT_DEFAULT%'
        OR NEW.text ILIKE '%GUARANTEE_SHORTED%'
        OR NEW.text ILIKE '%CRITICAL_SETTLEMENT_DISPUTE%'
    ) THEN

        -- Compile rolling 90-day ledger of independent infraction occurrences
        SELECT COUNT(DISTINCT id)
        INTO critical_count
        FROM public.user_reviews
        WHERE (
            target_promoter_id = target_id 
            OR venue_id = target_id 
            OR "group" = target_id
        )
        AND created_at >= (NEW.created_at - INTERVAL '90 days')
        AND (
            infraction_type IN ('SHORTED_PAYMENT', 'CONTRACT_DEFAULT', 'GUARANTEE_SHORTED', 'BACKLINE_DEFAULT', 'HOSPITALITY_DEFAULT', 'UNSAFE_ENVIRONMENT')
            OR text ILIKE '%SHORTED_PAYMENT%'
            OR text ILIKE '%CONTRACT_DEFAULT%'
            OR text ILIKE '%GUARANTEE_SHORTED%'
            OR text ILIKE '%CRITICAL_SETTLEMENT_DISPUTE%'
        );

        -- If threshold of 2 or more distinct critical default infractions is reached within 90 days,
        -- dynamically append the immutable alert flag into the profile's creative_metadata
        IF critical_count >= 2 THEN
            -- Update the profiles table
            UPDATE public.profiles
            SET creative_metadata = COALESCE(creative_metadata, '{}'::jsonb) || jsonb_build_object(
                'CRITICAL_SETTLEMENT_DISPUTE', true,
                'reputation_flags', COALESCE(creative_metadata->'reputation_flags', '[]'::jsonb) || '"CRITICAL_SETTLEMENT_DISPUTE"'::jsonb,
                'payment_defaults_count', COALESCE((creative_metadata->>'payment_defaults_count')::int, 0) + 1,
                'last_reputation_audit_at', NEW.created_at
            ),
            promoter_metadata = COALESCE(promoter_metadata, '{}'::jsonb) || jsonb_build_object(
                'CRITICAL_SETTLEMENT_DISPUTE', true,
                'reputation_flags', COALESCE(promoter_metadata->'reputation_flags', '[]'::jsonb) || '"CRITICAL_SETTLEMENT_DISPUTE"'::jsonb,
                'payment_defaults_count', COALESCE((promoter_metadata->>'payment_defaults_count')::int, 0) + 1,
                'last_reputation_audit_at', NEW.created_at
            )
            WHERE id = target_id OR full_name = target_id;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger cleanly to user_reviews table
DROP TRIGGER IF EXISTS trg_audit_promoter_reputation ON public.user_reviews;

CREATE TRIGGER trg_audit_promoter_reputation
AFTER INSERT OR UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.audit_promoter_reputation_trigger_fn();
