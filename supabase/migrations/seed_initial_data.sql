BEGIN;

-- Seed pessoas
INSERT INTO public.pessoas (nome) SELECT 'Paulo H.'     WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Paulo H.');
INSERT INTO public.pessoas (nome) SELECT 'Eduardo S.'   WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Eduardo S.');
INSERT INTO public.pessoas (nome) SELECT 'Maycon A.'    WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Maycon A.');
INSERT INTO public.pessoas (nome) SELECT 'Guilherme T.' WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Guilherme T.');
INSERT INTO public.pessoas (nome) SELECT 'Rejeane M.'   WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Rejeane M.');
INSERT INTO public.pessoas (nome) SELECT 'Ayeska A.'    WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Ayeska A.');
INSERT INTO public.pessoas (nome) SELECT 'Francisco S.' WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Francisco S.');
INSERT INTO public.pessoas (nome) SELECT 'Joao C.'      WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Joao C.');
INSERT INTO public.pessoas (nome) SELECT 'Martielo O.'  WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Martielo O.');
INSERT INTO public.pessoas (nome) SELECT 'Gustavo C.'   WHERE NOT EXISTS (SELECT 1 FROM public.pessoas WHERE nome='Gustavo C.');

-- Seed carros
INSERT INTO public.carros (placa, modelo, ano, km_atual, tanque)
VALUES ('TMA3I25','T-Cross',2025,0,100)
ON CONFLICT (placa) DO NOTHING;

INSERT INTO public.carros (placa, modelo, ano, km_atual, tanque)
VALUES ('TMB1H54','T-Cross',2025,0,100)
ON CONFLICT (placa) DO NOTHING;

COMMIT;

