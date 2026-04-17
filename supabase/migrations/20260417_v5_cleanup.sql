-- Consolidate auditing: Add printer_name to batches and remove the audit table
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS printer_name TEXT;

-- Drop the redundant audit table and its policies
DROP TABLE IF EXISTS public.print_audit_logs;
