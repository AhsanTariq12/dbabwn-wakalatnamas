/**
 * Migration: Remove Distributor Name
 * We no longer track distributor names in the batches.
 * Run this in Supabase SQL Editor.
 */

ALTER TABLE public.batches DROP COLUMN distributor_name;
