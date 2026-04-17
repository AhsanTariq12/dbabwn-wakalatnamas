/**
 * Run this snippet in your Supabase SQL editor to upgrade the schema
 * for Phase 2: Adding Wakalat Nama Types (Diwani vs Fojdaari)
 */

CREATE TYPE w_type AS ENUM ('diwani', 'fojdaari');

ALTER TABLE public.batches 
ADD COLUMN wakalat_type w_type NOT NULL DEFAULT 'diwani'::w_type;

-- Optional: update the default if you want to drop it later, but we can leave it
