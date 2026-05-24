"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Pencil } from "lucide-react"
import { createTrip, updateTrip, getActiveTrucks } from "@/app/dashboard/viagens/actions"
import type { Trip, Truck } from "@/lib/types"

interface TripFormDialogProps {
  trip?: Trip
  trigger?: React.ReactNode
}

export function TripFormDialog({ trip, trigger }: TripFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const router = useRouter()

  const [formData, setFormData] = useState({
    truck_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "" as string | null,
    origin: "",
    destination: "",
    km_start: "" as number | string,
    km_end: "" as number | string | null,
    // Rodado vazio
    empty_km: "" as number | string | null,
    empty_fuel_liters: "" as number | string | null,
    empty_fuel_cost: "" as number | string | null,
    status: "in_progress" as "in_progress" | "completed" | "cancelled",
  })

  useEffect(() => {
    if (open) {
      getActiveTrucks().then(setTrucks)
    }
  }, [open])

  useEffect(() => {
    if (trip) {
      setFormData({
        truck_id: trip.truck_id,
        start_date: trip.start_date,
        end_date: trip.end_date || "",
        origin: trip.origin,
        destination: trip.destination,
        km_start: trip.km_start ?? "",
        km_end: trip.km_end ?? "",
        empty_km: trip.empty_km ?? "",
        empty_fuel_liters: trip.empty_fuel_liters ?? "",
        empty_fuel_cost: trip.empty_fuel_cost ?? "",
        status: trip.status,
      })
    }
  }, [trip])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validar km_start obrigatório
    if (!formData.km_start || formData.km_start === "") {
      setError("Km inicial é obrigatório")
      setLoading(false)
      return
    }

    // Validar truck_id obrigatório
    if (!formData.truck_id) {
      setError("Selecione um caminhão")
      setLoading(false)
      return
    }

    const dataToSubmit = {
      ...formData,
      end_date: formData.end_date || null,
      km_start: typeof formData.km_start === "string" ? parseFloat(formData.km_start) : formData.km_start,
      km_end: formData.km_end !== "" && formData.km_end !== null ? (typeof formData.km_end === "string" ? parseFloat(formData.km_end) : formData.km_end) : null,
      empty_km: formData.empty_km !== "" && formData.empty_km !== null ? (typeof formData.empty_km === "string" ? parseFloat(formData.empty_km) : formData.empty_km) : null,
      empty_fuel_liters: formData.empty_fuel_liters !== "" && formData.empty_fuel_liters !== null ? (typeof formData.empty_fuel_liters === "string" ? parseFloat(formData.empty_fuel_liters) : formData.empty_fuel_liters) : null,
      empty_fuel_cost: formData.empty_fuel_cost !== "" && formData.empty_fuel_cost !== null ? (typeof formData.empty_fuel_cost === "string" ? parseFloat(formData.empty_fuel_cost) : formData.empty_fuel_cost) : null,
    }

    const result = trip
      ? await updateTrip(trip.id, dataToSubmit)
      : await createTrip(dataToSubmit)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Viagem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {trip ? "Editar Viagem" : "Nova Viagem"}
          </DialogTitle>
          <DialogDescription>
            {trip
              ? "Atualize as informacoes da viagem"
              : "Preencha os dados para registrar uma nova viagem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Field>
              <FieldLabel htmlFor="truck">Caminhao</FieldLabel>
              <Select
                value={formData.truck_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, truck_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um caminhao" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.plate} - {truck.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="origin">Origem</FieldLabel>
                <Input
                  id="origin"
                  placeholder="Sao Paulo, SP"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="destination">Destino</FieldLabel>
                <Input
                  id="destination"
                  placeholder="Rio de Janeiro, RJ"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="start_date">Data Inicio</FieldLabel>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="end_date">Data Fim</FieldLabel>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value || null })
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="km_start">Km Inicial</FieldLabel>
                <Input
                  id="km_start"
                  type="number"
                  step="0.1"
                  value={formData.km_start}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value ? parseFloat(value) : ""
                    setFormData({ 
                      ...formData, 
                      km_start: Number.isNaN(numValue) ? "" : numValue
                    })
                  }}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="km_end">Km Final</FieldLabel>
                <Input
                  id="km_end"
                  type="number"
                  step="0.1"
                  value={formData.km_end ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value ? parseFloat(value) : ""
                    setFormData({
                      ...formData,
                      km_end: Number.isNaN(numValue) ? "" : numValue,
                    })
                  }}
                />
              </Field>
            </div>
            {/* Seção Rodado Vazio */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <h3 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
                🚛 Rodado Vazio (deslocamento sem carga)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="empty_km">KM Vazio</FieldLabel>
                  <Input
                    id="empty_km"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formData.empty_km ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = value ? parseFloat(value) : ""
                      setFormData({
                        ...formData,
                        empty_km: Number.isNaN(numValue) ? "" : numValue,
                      })
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="empty_fuel_liters">Litros</FieldLabel>
                  <Input
                    id="empty_fuel_liters"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formData.empty_fuel_liters ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = value ? parseFloat(value) : ""
                      setFormData({
                        ...formData,
                        empty_fuel_liters: Number.isNaN(numValue) ? "" : numValue,
                      })
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="empty_fuel_cost">Custo Combustivel</FieldLabel>
                  <Input
                    id="empty_fuel_cost"
                    type="number"
                    step="0.01"
                    placeholder="R$ 0,00"
                    value={formData.empty_fuel_cost ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = value ? parseFloat(value) : ""
                      setFormData({
                        ...formData,
                        empty_fuel_cost: Number.isNaN(numValue) ? "" : numValue,
                      })
                    }}
                  />
                </Field>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Deslocamento sem carga entre fretes. Gera custo mas não gera receita.
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={formData.status}
                onValueChange={(value: "in_progress" | "completed" | "cancelled") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !formData.truck_id}>
                {loading ? <Spinner className="mr-2" /> : null}
                {trip ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditTripButton({ trip }: { trip: Trip }) {
  return (
    <TripFormDialog
      trip={trip}
      trigger={
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    />
  )
}
