BEGIN;
-- Corrigir deslocamento de -1 dia nas datas (ajuste geral)
UPDATE public.reservas
SET ida = ida + INTERVAL '1 day',
    volta = volta + INTERVAL '1 day'
WHERE TRUE;
COMMIT;

