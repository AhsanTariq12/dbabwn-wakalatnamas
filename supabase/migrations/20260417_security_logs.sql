-- Create Audit Logs for Printing Operations
CREATE TABLE IF NOT EXISTS public.print_audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    quantity integer NOT NULL,
    amount numeric NOT NULL,
    printer_name text NOT NULL,
    status text NOT NULL DEFAULT 'attempted', -- attempted, success, failed
    error_message text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT print_audit_logs_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.print_audit_logs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view audit logs (for transparency)
CREATE POLICY "Allow authenticated read audit logs" 
ON public.print_audit_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Anyone authenticated can insert (to log their own actions)
CREATE POLICY "Allow authenticated insert audit logs" 
ON public.print_audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
