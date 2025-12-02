-- Core tables for Reserva de Carro
-- Schema: public

-- Enum for reservation status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM (
      'pendente',
      'aprovada',
      'em_viagem',
      'concluida',
      'cancelada'
    );
  END IF;
END
$$;

-- Pessoas: condutores e acompanhantes
CREATE TABLE IF NOT EXISTS public.pessoas (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Carros: dados do veículo
CREATE TABLE IF NOT EXISTS public.carros (
  id BIGSERIAL PRIMARY KEY,
  km_atual INTEGER NOT NULL CHECK (km_atual >= 0),
  tanque INTEGER NOT NULL CHECK (tanque BETWEEN 0 AND 100), -- percentual 0-100
  ultima_reserva TIMESTAMPTZ,
  ultimo_uso TIMESTAMPTZ,
  ultima_revisao DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservas: dados da reserva
CREATE TABLE IF NOT EXISTS public.reservas (
  id BIGSERIAL PRIMARY KEY,
  destinos TEXT[] NOT NULL DEFAULT '{}',
  ida DATE NOT NULL,
  volta DATE NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relação pessoas em reservas (condutor/acompanhante)
CREATE TABLE IF NOT EXISTS public.reserva_pessoas (
  reserva_id BIGINT NOT NULL REFERENCES public.reservas(id) ON DELETE CASCADE,
  pessoa_id BIGINT NOT NULL REFERENCES public.pessoas(id) ON DELETE RESTRICT,
  papel TEXT NOT NULL CHECK (papel IN ('condutor','acompanhante')),
  PRIMARY KEY (reserva_id, pessoa_id, papel)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_reservas_status ON public.reservas(status);
CREATE INDEX IF NOT EXISTS idx_reservas_ida_volta ON public.reservas(ida, volta);
CREATE INDEX IF NOT EXISTS idx_reserva_pessoas_pessoa ON public.reserva_pessoas(pessoa_id);

