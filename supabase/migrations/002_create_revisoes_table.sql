-- Tabela de Revisões (revisoes)
CREATE TABLE revisoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carro_id UUID REFERENCES carros(id) ON DELETE CASCADE,
    data_revisao DATE NOT NULL,
    quilometragem INTEGER NOT NULL,
    tipo VARCHAR(50) DEFAULT 'preventiva' CHECK (tipo IN ('preventiva', 'corretiva', 'troca_oleo')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'atrasada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index
CREATE INDEX idx_revisoes_carro_id ON revisoes(carro_id);
CREATE INDEX idx_revisoes_status ON revisoes(status);

-- permissões
GRANT SELECT ON revisoes TO anon;
GRANT ALL PRIVILEGES ON revisoes TO authenticated;