BEGIN;
ALTER TABLE public.pessoas DROP COLUMN IF EXISTS created_at;
ALTER TABLE public.carros DROP COLUMN IF EXISTS created_at;
ALTER TABLE public.reservas DROP COLUMN IF EXISTS created_at;
COMMIT;

