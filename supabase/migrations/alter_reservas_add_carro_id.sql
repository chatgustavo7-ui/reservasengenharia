BEGIN;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS carro_id BIGINT REFERENCES public.carros(id);
COMMIT;

