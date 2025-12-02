BEGIN;
ALTER TABLE public.reservas
  ALTER COLUMN ida TYPE timestamptz USING ida::timestamptz,
  ALTER COLUMN volta TYPE timestamptz USING volta::timestamptz;
COMMIT;

