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
import { createTruck, updateTruck, type TruckFormData, type TruckActionResult } from "@/app/dashboard/caminhoes/actions"
import type { Truck } from "@/lib/types"

interface TruckFormDialogProps {
  truck?: Truck
  trigger?: React.ReactNode
}

export function TruckFormDialog({ truck, trigger }: TruckFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    year: new Date().getFullYear(),
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    if (truck) {
      setFormData({
        plate: truck.plate,
        model: truck.model,
        year: truck.year,
        status: truck.status,
      })
    }
  }, [truck])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validação local antes de enviar
      if (!formData.plate?.trim()) {
        setError("Placa é obrigatória")
        setLoading(false)
        return
      }

      if (!formData.model?.trim()) {
        setError("Modelo é obrigatório")
        setLoading(false)
        return
      }

      if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        setError("Ano inválido")
        setLoading(false)
        return
      }

      const result: TruckActionResult = truck
        ? await updateTruck(truck.id, formData)
        : await createTruck(formData)

      if ("error" in result) {
        setError(result.error)
        setLoading(false)
        return
      }

      setLoading(false)
      setOpen(false)
      setFormData({
        plate: "",
        model: "",
        year: new Date().getFullYear(),
        status: "active",
      })
      router.refresh()
    } catch (err) {
      console.error("Error submitting truck form:", err)
      setError("Erro inesperado. Tente novamente.")
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Caminhao
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {truck ? "Editar Caminhao" : "Novo Caminhao"}
          </DialogTitle>
          <DialogDescription>
            {truck
              ? "Atualize as informacoes do caminhao"
              : "Preencha os dados para cadastrar um novo caminhao"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="plate">Placa</FieldLabel>
              <Input
                id="plate"
                placeholder="ABC-1234"
                value={formData.plate}
                onChange={(e) =>
                  setFormData({ ...formData, plate: e.target.value.toUpperCase() })
                }
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="model">Modelo</FieldLabel>
              <Input
                id="model"
                placeholder="Volvo FH 460"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="year">Ano</FieldLabel>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, year: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                {truck ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditTruckButton({ truck }: { truck: Truck }) {
  return (
    <TruckFormDialog
      truck={truck}
      trigger={
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    />
  )
}
