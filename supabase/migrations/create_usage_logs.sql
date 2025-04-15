
-- Create the usage_logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant necessary permissions
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow the service role to insert data
CREATE POLICY "Enable service role inserts" ON public.usage_logs
  FOR INSERT
  TO service_role
  USING (true);

-- Allow anon select access for debugging purposes (you can remove this for production)
CREATE POLICY "Allow anon select for debugging" ON public.usage_logs
  FOR SELECT
  TO anon
  USING (true);
