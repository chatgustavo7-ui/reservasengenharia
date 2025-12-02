-- Update reservation_status to only: pendente, concluida, em_viagem
-- Safe enum migration: create new type, convert column, drop old, rename new

BEGIN;

-- Ensure default is removed before type change
ALTER TABLE public.reservas ALTER COLUMN status DROP DEFAULT;

-- New enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status_new') THEN
    CREATE TYPE reservation_status_new AS ENUM ('pendente','concluida','em_viagem');
  END IF;
END $$;

-- Convert column to new type, mapping unknown values to 'pendente'
ALTER TABLE public.reservas
  ALTER COLUMN status TYPE reservation_status_new USING (
    CASE status::text
      WHEN 'pendente'   THEN 'pendente'::reservation_status_new
      WHEN 'concluida'  THEN 'concluida'::reservation_status_new
      WHEN 'em_viagem'  THEN 'em_viagem'::reservation_status_new
      ELSE 'pendente'::reservation_status_new
    END
  );

-- Restore default
ALTER TABLE public.reservas ALTER COLUMN status SET DEFAULT 'pendente'::reservation_status_new;

-- Drop old type if exists and unused
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    DROP TYPE reservation_status;
  END IF;
END $$;

-- Rename new type to original name
ALTER TYPE reservation_status_new RENAME TO reservation_status;

COMMIT;

