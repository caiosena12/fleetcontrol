// FleetControl Types

export interface Truck {
  id: string
  user_id: string
  plate: string
  model: string
  year: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  user_id: string
  truck_id: string
  start_date: string
  end_date: string | null
  origin: string
  destination: string
  km_start: number
  km_end: number | null
  km_total: number | null
  // Rodado vazio - deslocamento sem carga
  empty_km: number | null
  empty_fuel_liters: number | null
  empty_fuel_cost: number | null
  status: 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  // Joined data
  truck?: Truck
  freights?: Freight[]
  tolls?: Toll[]
  operational_costs?: OperationalCost[]
}

export interface Freight {
  id: string
  user_id: string
  trip_id: string
  amount: number
  cargo_type: string | null
  client: string | null
  status: 'pending' | 'received'
  created_at: string
  updated_at: string
}

export interface Toll {
  id: string
  user_id: string
  trip_id: string
  amount: number
  location: string
  toll_date: string | null
  created_at: string
}

export interface OperationalCost {
  id: string
  user_id: string
  trip_id: string
  cost_type: 'fuel' | 'food' | 'maintenance' | 'other'
  amount: number
  description: string | null
  liters: number | null
  created_at: string
}

export interface DashboardStats {
  totalRevenue: number
  totalCosts: number
  profit: number
  margin: number
  totalTrips: number
  activeTrips: number
  totalKm: number
  totalTrucks: number
  activeTrucks: number
}

export interface MonthlyData {
  month: string
  revenue: number
  costs: number
  profit: number
}

export interface CostBreakdown {
  type: string
  amount: number
  percentage: number
}
