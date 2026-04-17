/**
 * Migration: Revert Wakalat Type
 * We have unified the Wakalat Namas into a single structure.
 * Run this in Supabase SQL Editor.
 */

ALTER TABLE public.batches DROP COLUMN wakalat_type;
DROP TYPE w_type;
