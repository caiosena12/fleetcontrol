"use server"

import { createClient } from "@/lib/supabase/server"
import type { DashboardStats, MonthlyData, CostBreakdown, Trip } from "@/lib/types"
import { formatMonthYear, toDateOnly } from "@/lib/date-utils"
import {
  calculateAggregateMetrics,
  calculateTripMetrics,
} from "@/lib/trip-calculations"

type MonthlyTrip = Pick<
  Trip,
  "start_date" | "freights" | "tolls" | "operational_costs" | "empty_fuel_cost"
>

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
  const metrics = tripsData.map((trip: Trip) => calculateTripMetrics(trip))
  const totals = calculateAggregateMetrics(metrics)

  return {
    totalRevenue: totals.revenue,
    totalCosts: totals.totalCosts,
    profit: totals.profit,
    margin: totals.margin,
    totalTrips: tripsData.length,
    activeTrips: tripsData.filter((trip: Trip) => trip.status === "in_progress").length,
    totalKm: totals.totalKm,
    loadedKm: totals.loadedKm,
    emptyKm: totals.emptyKm,
    totalFuelLiters: totals.totalFuelLiters,
    avgFuelPrice: totals.averageFuelPrice,
    avgConsumption: totals.averageConsumption,
    avgEmptyConsumption: totals.emptyConsumption,
    emptyKmPercentage: totals.emptyKmPercentage,
    costPerKm: totals.costPerKm,
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
      empty_fuel_cost,
      freights (*),
      tolls (*),
      operational_costs (*)
    `)
    .gte("start_date", toDateOnly(sixMonthsAgo))

  const monthlyMap = new Map<string, { revenue: number; costs: number }>()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const key = formatMonthYear(date)
    monthlyMap.set(key, { revenue: 0, costs: 0 })
  }

  ;((trips || []) as MonthlyTrip[]).forEach((trip) => {
    const key = formatMonthYear(trip.start_date)
    
    const current = monthlyMap.get(key) || { revenue: 0, costs: 0 }
    const tripMetrics = calculateTripMetrics(trip)

    current.revenue += tripMetrics.revenue
    current.costs += tripMetrics.totalCosts

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

  const { data: trips } = await supabase
    .from("trips")
    .select("empty_fuel_cost")

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

  const totalEmptyFuel = (trips || []).reduce(
    (sum, trip) => sum + Number(trip.empty_fuel_cost || 0),
    0
  )
  if (totalEmptyFuel > 0) {
    costsByType.set("empty_fuel", totalEmptyFuel)
  }

  const total = Array.from(costsByType.values()).reduce((sum, v) => sum + v, 0)

  const typeLabels: Record<string, string> = {
    fuel: "Combustivel",
    food: "Alimentacao",
    maintenance: "Manutencao",
    tolls: "Pedagios",
    empty_fuel: "Rodado Vazio",
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
