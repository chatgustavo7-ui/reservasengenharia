-- Tabela de Carros (carros)
CREATE TABLE carros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(10) UNIQUE NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'manutencao', 'reservado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index
CREATE INDEX idx_carros_status ON carros(status);
CREATE INDEX idx_carros_placa ON carros(placa);

-- permissões
GRANT SELECT ON carros TO anon;
GRANT ALL PRIVILEGES ON carros TO authenticated;