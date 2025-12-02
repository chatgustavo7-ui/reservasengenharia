-- Tabela de Tanque (tanque_status)
CREATE TABLE tanque_status (
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

-- create index
CREATE INDEX idx_tanque_carro_id ON tanque_status(carro_id);
CREATE INDEX idx_tanque_status ON tanque_status(status);

-- permissões
GRANT SELECT ON tanque_status TO anon;
GRANT ALL PRIVILEGES ON tanque_status TO authenticated;