-- Create revisoes table if not exists
CREATE TABLE IF NOT EXISTS revisoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carro_id UUID REFERENCES carros(id) ON DELETE CASCADE,
    data_revisao DATE NOT NULL,
    quilometragem INTEGER NOT NULL,
    tipo VARCHAR(50) DEFAULT 'preventiva' CHECK (tipo IN ('preventiva', 'corretiva', 'troca_oleo')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'atrasada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tanque_status table if not exists
CREATE TABLE IF NOT EXISTS tanque_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carro_id UUID REFERENCES carros(id) ON DELETE CASCADE,
    nivel_percentual INTEGER CHECK (nivel_percentual >= 0 AND nivel_percentual <= 100),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN nivel_percentual <= 15 THEN 'critico'
            WHEN nivel_percentual <= 30 THEN 'baixo'
            WHEN nivel_percentual <= 70 THEN 'medio'
            ELSE 'alto'
        END
    ) STORED
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revisoes_carro_id ON revisoes(carro_id);
CREATE INDEX IF NOT EXISTS idx_revisoes_status ON revisoes(status);
CREATE INDEX IF NOT EXISTS idx_tanque_carro_id ON tanque_status(carro_id);
CREATE INDEX IF NOT EXISTS idx_tanque_status ON tanque_status(status);

-- Grant permissions
GRANT SELECT ON revisoes TO anon;
GRANT ALL PRIVILEGES ON revisoes TO authenticated;
GRANT SELECT ON tanque_status TO anon;
GRANT ALL PRIVILEGES ON tanque_status TO authenticated;