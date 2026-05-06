-- FleetControl Database Schema
-- Sistema de Gestão de Frotas

-- Tabela de Caminhões
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate VARCHAR(10) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Viagens
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  km_start DECIMAL(10,1) NOT NULL,
  km_end DECIMAL(10,1),
  km_total DECIMAL(10,1) GENERATED ALWAYS AS (COALESCE(km_end, km_start) - km_start) STORED,
  -- Rodado vazio - deslocamento sem carga
  empty_km DECIMAL(10,1),
  empty_fuel_liters DECIMAL(10,2),
  empty_fuel_cost DECIMAL(12,2),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT km_end_greater_than_start CHECK (km_end IS NULL OR km_end >= km_start)
);

-- Tabela de Fretes (Receitas)
CREATE TABLE IF NOT EXISTS freights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  cargo_type VARCHAR(100),
  client VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Pedágios
CREATE TABLE IF NOT EXISTS tolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  toll_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Custos Operacionais
CREATE TABLE IF NOT EXISTS operational_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN ('fuel', 'food', 'maintenance', 'other')),
  amount DECIMAL(12,2) NOT NULL,
  description VARCHAR(255),
  liters DECIMAL(10,2), -- apenas para combustível
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_trucks_user_id ON trucks(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck_id ON trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_freights_trip_id ON freights(trip_id);
CREATE INDEX IF NOT EXISTS idx_tolls_trip_id ON tolls(trip_id);
CREATE INDEX IF NOT EXISTS idx_operational_costs_trip_id ON operational_costs(trip_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE freights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para trucks
CREATE POLICY "trucks_select_own" ON trucks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trucks_insert_own" ON trucks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trucks_update_own" ON trucks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trucks_delete_own" ON trucks FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para trips
CREATE POLICY "trips_select_own" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trips_insert_own" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_update_own" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trips_delete_own" ON trips FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para freights
CREATE POLICY "freights_select_own" ON freights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "freights_insert_own" ON freights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "freights_update_own" ON freights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "freights_delete_own" ON freights FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para tolls
CREATE POLICY "tolls_select_own" ON tolls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tolls_insert_own" ON tolls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tolls_update_own" ON tolls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tolls_delete_own" ON tolls FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para operational_costs
CREATE POLICY "operational_costs_select_own" ON operational_costs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "operational_costs_insert_own" ON operational_costs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "operational_costs_update_own" ON operational_costs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "operational_costs_delete_own" ON operational_costs FOR DELETE USING (auth.uid() = user_id);
