BEGIN;
ALTER TABLE public.reservas
  ALTER COLUMN ida TYPE date USING ida::date,
  ALTER COLUMN volta TYPE date USING volta::date;
COMMIT;

