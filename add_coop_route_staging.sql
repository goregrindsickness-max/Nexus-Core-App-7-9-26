CREATE TABLE IF NOT EXISTS public.staged_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_name TEXT NOT NULL,
  host_band_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'SANDBOX', -- ['SANDBOX', 'LOCKED_COOP', 'TRANSMITTED']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.staged_tour_bands (
  staged_tour_id UUID REFERENCES public.staged_tours(id) ON DELETE CASCADE,
  band_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_accepted BOOLEAN DEFAULT false,
  financial_cut_percentage NUMERIC DEFAULT 0.00,
  PRIMARY KEY (staged_tour_id, band_id)
);

CREATE TABLE IF NOT EXISTS public.staged_tour_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staged_tour_id UUID REFERENCES public.staged_tours(id) ON DELETE CASCADE,
  calendar_date DATE NOT NULL,
  target_city TEXT NOT NULL,
  target_venue_name TEXT NOT NULL,
  expected_load_in TIME,
  expected_show_start TIME,
  gear_sharing_notes TEXT DEFAULT 'NONE',
  node_status TEXT DEFAULT 'PROPOSED' -- ['PROPOSED', 'PROMOTER_PINGED', 'CONFIRMED']
);
