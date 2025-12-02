BEGIN;
CREATE TABLE IF NOT EXISTS public.keepalive_logs (
  id BIGSERIAL PRIMARY KEY,
  pinged_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.keepalive_ping()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  INSERT INTO public.keepalive_logs DEFAULT VALUES;
  SELECT true;
$$;

GRANT EXECUTE ON FUNCTION public.keepalive_ping() TO anon;
COMMIT;

