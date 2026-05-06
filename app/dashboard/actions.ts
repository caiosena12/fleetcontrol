"use server"

import { createClient } from "@/lib/supabase/server"
import type { DashboardStats, MonthlyData, CostBreakdown, Trip } from "@/lib/types"

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  
  // Get trips with all related data
  const { data: trips } = await supabase
    .from("trips")
    .select(`
      *,
      freights (*),
      tolls (*),
      operational_costs (*)
    `)

  // Get trucks count
  const { data: trucks } = await supabase
    .from("trucks")
    .select("id, status")

  const tripsData = trips || []
  const trucksData = trucks || []

  // Calculate totals
  let totalRevenue = 0
  let totalCosts = 0
  let totalKm = 0
  let activeTrips = 0

  tripsData.forEach((trip: Trip) => {
    // Revenue from freights
    if (trip.freights) {
      totalRevenue += trip.freights.reduce((sum, f) => sum + Number(f.amount), 0)
    }
    
    // Costs from tolls and operational costs
    if (trip.tolls) {
      totalCosts += trip.tolls.reduce((sum, t) => sum + Number(t.amount), 0)
    }
    if (trip.operational_costs) {
      totalCosts += trip.operational_costs.reduce((sum, c) => sum + Number(c.amount), 0)
    }

    // Custo do rodado vazio (deslocamento sem carga)
    if (trip.empty_fuel_cost) {
      totalCosts += Number(trip.empty_fuel_cost)
    }

    // Kilometers (incluindo rodado vazio)
    if (trip.km_total) {
      totalKm += Number(trip.km_total)
    }
    if (trip.empty_km) {
      totalKm += Number(trip.empty_km)
    }

    // Active trips
    if (trip.status === "in_progress") {
      activeTrips++
    }
  })

  const profit = totalRevenue - totalCosts
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  return {
    totalRevenue,
    totalCosts,
    profit,
    margin,
    totalTrips: tripsData.length,
    activeTrips,
    totalKm,
    totalTrucks: trucksData.length,
    activeTrucks: trucksData.filter(t => t.status === "active").length,
  }
}

export async function getMonthlyData(): Promise<MonthlyData[]> {
  const supabase = await createClient()
  
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      start_date,
      freights (*),
      tolls (*),
      operational_costs (*)
    `)
    .gte("start_date", sixMonthsAgo.toISOString().split("T")[0])

  const monthlyMap = new Map<string, { revenue: number; costs: number }>()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const key = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    monthlyMap.set(key, { revenue: 0, costs: 0 })
  }

  ;(trips || []).forEach((trip: Trip) => {
    const date = new Date(trip.start_date)
    const key = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    
    const current = monthlyMap.get(key) || { revenue: 0, costs: 0 }
    
    if (trip.freights) {
      current.revenue += trip.freights.reduce((sum, f) => sum + Number(f.amount), 0)
    }
    if (trip.tolls) {
      current.costs += trip.tolls.reduce((sum, t) => sum + Number(t.amount), 0)
    }
    if (trip.operational_costs) {
      current.costs += trip.operational_costs.reduce((sum, c) => sum + Number(c.amount), 0)
    }
    // Custo do rodado vazio
    if (trip.empty_fuel_cost) {
      current.costs += Number(trip.empty_fuel_cost)
    }

    monthlyMap.set(key, current)
  })

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    costs: data.costs,
    profit: data.revenue - data.costs,
  }))
}

export async function getCostBreakdown(): Promise<CostBreakdown[]> {
  const supabase = await createClient()

  const { data: operationalCosts } = await supabase
    .from("operational_costs")
    .select("cost_type, amount")

  const { data: tolls } = await supabase
    .from("tolls")
    .select("amount")

  const costsByType = new Map<string, number>()
  
  // Add operational costs
  ;(operationalCosts || []).forEach(cost => {
    const current = costsByType.get(cost.cost_type) || 0
    costsByType.set(cost.cost_type, current + Number(cost.amount))
  })

  // Add tolls as a category
  const totalTolls = (tolls || []).reduce((sum, t) => sum + Number(t.amount), 0)
  if (totalTolls > 0) {
    costsByType.set("tolls", totalTolls)
  }

  const total = Array.from(costsByType.values()).reduce((sum, v) => sum + v, 0)

  const typeLabels: Record<string, string> = {
    fuel: "Combustivel",
    food: "Alimentacao",
    maintenance: "Manutencao",
    tolls: "Pedagios",
    other: "Outros",
  }

  return Array.from(costsByType.entries())
    .map(([type, amount]) => ({
      type: typeLabels[type] || type,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export async function getRecentTrips() {
  const supabase = await createClient()

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      *,
      truck:trucks (plate, model),
      freights (amount)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return trips || []
}
