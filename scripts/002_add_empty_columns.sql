-- Adicionar colunas de "Rodado Vazio" se não existirem

ALTER TABLE trips
ADD COLUMN IF NOT EXISTS empty_km DECIMAL(10,1),
ADD COLUMN IF NOT EXISTS empty_fuel_liters DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS empty_fuel_cost DECIMAL(12,2);

-- Recriar a coluna computed km_total se necessário
-- (Este comando pode gerar erro se a coluna já existe, nesse caso ignore)
ALTER TABLE trips
DROP COLUMN IF EXISTS km_total;

ALTER TABLE trips
ADD COLUMN km_total DECIMAL(10,1) GENERATED ALWAYS AS (COALESCE(km_end, km_start) - km_start) STORED;
