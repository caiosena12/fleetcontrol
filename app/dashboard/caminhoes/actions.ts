"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Truck } from "@/lib/types"

export async function getTrucks(): Promise<Truck[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trucks:", error)
    return []
  }

  return data || []
}

export async function getTruck(id: string): Promise<Truck | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching truck:", error)
    return null
  }

  return data
}

export interface TruckFormData {
  plate: string
  model: string
  year: number
  status: "active" | "inactive"
}

export type TruckActionResult = 
  | { success: true; error?: never }
  | { success?: never; error: string }

export async function createTruck(formData: TruckFormData): Promise<TruckActionResult> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: "Usuario nao autenticado" }
    }

    // Validação de campos
    if (!formData.plate?.trim() || !formData.model?.trim()) {
      return { error: "Placa e modelo são obrigatórios" }
    }

    const { error } = await supabase.from("trucks").insert({
      ...formData,
      user_id: user.id,
    })

    if (error) {
      console.error("Error creating truck:", error)
      return { error: `Erro ao criar caminhao: ${error.message}` }
    }

    revalidatePath("/dashboard/caminhoes")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error creating truck:", err)
    return { error: "Erro inesperado ao criar caminhao" }
  }
}

export async function updateTruck(id: string, formData: TruckFormData): Promise<TruckActionResult> {
  try {
    const supabase = await createClient()
    
    if (!formData.plate?.trim() || !formData.model?.trim()) {
      return { error: "Placa e modelo são obrigatórios" }
    }

    const { error } = await supabase
      .from("trucks")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating truck:", error)
      return { error: `Erro ao atualizar caminhao: ${error.message}` }
    }

    revalidatePath("/dashboard/caminhoes")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error updating truck:", err)
    return { error: "Erro inesperado ao atualizar caminhao" }
  }
}

export async function deleteTruck(id: string): Promise<TruckActionResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("trucks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting truck:", error)
      return { error: `Erro ao excluir caminhao: ${error.message}` }
    }

    revalidatePath("/dashboard/caminhoes")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error deleting truck:", err)
    return { error: "Erro inesperado ao excluir caminhao" }
  }
}
