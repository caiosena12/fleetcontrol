"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Trip, Freight, Toll, OperationalCost, Truck } from "@/lib/types"

export async function getTrips(): Promise<(Trip & { truck: Truck | null })[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      truck:trucks (*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trips:", error)
    return []
  }

  return data || []
}

export async function getTrip(id: string): Promise<Trip | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      truck:trucks (*),
      freights (*),
      tolls (*),
      operational_costs (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching trip:", error)
    return null
  }

  return data
}

export async function getActiveTrucks(): Promise<Truck[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .eq("status", "active")
    .order("plate")

  if (error) {
    console.error("Error fetching active trucks:", error)
    return []
  }

  return data || []
}

interface TripFormData {
  truck_id: string
  start_date: string
  end_date?: string | null
  origin: string
  destination: string
  km_start: number
  km_end?: number | null
  // Rodado vazio
  empty_km?: number | null
  empty_fuel_liters?: number | null
  empty_fuel_cost?: number | null
  status: "in_progress" | "completed" | "cancelled"
}

export async function createTrip(formData: TripFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuario nao autenticado" }
  }

  const { error } = await supabase.from("trips").insert({
    ...formData,
    user_id: user.id,
  })

  if (error) {
    console.error("Error creating trip:", error)
    return { error: "Erro ao criar viagem" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function updateTrip(id: string, formData: TripFormData) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("trips")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating trip:", error)
    return { error: "Erro ao atualizar viagem" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function deleteTrip(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting trip:", error)
    return { error: "Erro ao excluir viagem" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

// Freight actions
interface FreightFormData {
  trip_id: string
  amount: number
  cargo_type?: string | null
  client?: string | null
  status: "pending" | "received"
}

export async function addFreight(formData: FreightFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuario nao autenticado" }
  }

  const { error } = await supabase.from("freights").insert({
    ...formData,
    user_id: user.id,
  })

  if (error) {
    console.error("Error adding freight:", error)
    return { error: "Erro ao adicionar frete" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function deleteFreight(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("freights")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting freight:", error)
    return { error: "Erro ao excluir frete" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

// Toll actions
interface TollFormData {
  trip_id: string
  amount: number
  location: string
  toll_date?: string | null
}

export async function addToll(formData: TollFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuario nao autenticado" }
  }

  const { error } = await supabase.from("tolls").insert({
    ...formData,
    user_id: user.id,
  })

  if (error) {
    console.error("Error adding toll:", error)
    return { error: "Erro ao adicionar pedagio" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function deleteToll(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("tolls")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting toll:", error)
    return { error: "Erro ao excluir pedagio" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

// Operational cost actions
interface OperationalCostFormData {
  trip_id: string
  cost_type: "fuel" | "food" | "maintenance" | "other"
  amount: number
  description?: string | null
  liters?: number | null
}

export async function addOperationalCost(formData: OperationalCostFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuario nao autenticado" }
  }

  const { error } = await supabase.from("operational_costs").insert({
    ...formData,
    user_id: user.id,
  })

  if (error) {
    console.error("Error adding operational cost:", error)
    return { error: "Erro ao adicionar custo" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function deleteOperationalCost(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("operational_costs")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting operational cost:", error)
    return { error: "Erro ao excluir custo" }
  }

  revalidatePath("/dashboard/viagens", "max")
  revalidatePath("/dashboard", "max")
  return { success: true }
}
