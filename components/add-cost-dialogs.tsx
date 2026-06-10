"use client"

import { useState } from "react"
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
import { Plus } from "lucide-react"
import {
  addFreight,
  addToll,
  addOperationalCost,
} from "@/app/dashboard/viagens/actions"

interface AddFreightDialogProps {
  tripId: string
}

export function AddFreightDialog({ tripId }: AddFreightDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    amount: "" as string | number,
    cargo_type: "",
    client: "",
    status: "pending" as "pending" | "received",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const amount = formData.amount ? parseFloat(String(formData.amount)) : 0
    if (isNaN(amount)) {
      setLoading(false)
      return
    }

    await addFreight({
      trip_id: tripId,
      amount,
      cargo_type: formData.cargo_type || null,
      client: formData.client || null,
      status: formData.status,
    })

    setLoading(false)
    setOpen(false)
    setFormData({ amount: "", cargo_type: "", client: "", status: "pending" })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Frete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Frete</DialogTitle>
          <DialogDescription>
            Registre um novo frete para esta viagem
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount">Valor (R$)</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="client">Cliente</FieldLabel>
              <Input
                id="client"
                placeholder="Nome do cliente"
                value={formData.client}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cargo_type">Tipo de Carga</FieldLabel>
              <Input
                id="cargo_type"
                placeholder="Ex: Graos, Combustivel"
                value={formData.cargo_type}
                onChange={(e) =>
                  setFormData({ ...formData, cargo_type: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={formData.status}
                onValueChange={(value: "pending" | "received") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="received">Recebido</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                Adicionar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface AddTollDialogProps {
  tripId: string
}

export function AddTollDialog({ tripId }: AddTollDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    amount: "" as string | number,
    location: "",
    toll_date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const amount = formData.amount ? parseFloat(String(formData.amount)) : 0
    if (isNaN(amount)) {
      setLoading(false)
      return
    }

    await addToll({
      trip_id: tripId,
      amount,
      location: formData.location,
      toll_date: formData.toll_date || null,
    })

    setLoading(false)
    setOpen(false)
    setFormData({
      amount: "",
      location: "",
      toll_date: new Date().toISOString().split("T")[0],
    })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pedagio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Pedagio</DialogTitle>
          <DialogDescription>
            Registre um pedagio pago nesta viagem
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="toll_amount">Valor (R$)</FieldLabel>
              <Input
                id="toll_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="location">Local</FieldLabel>
              <Input
                id="location"
                placeholder="Nome da praca de pedagio"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="toll_date">Data</FieldLabel>
              <Input
                id="toll_date"
                type="date"
                value={formData.toll_date}
                onChange={(e) =>
                  setFormData({ ...formData, toll_date: e.target.value })
                }
              />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                Adicionar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface AddOperationalCostDialogProps {
  tripId: string
}

export function AddOperationalCostDialog({ tripId }: AddOperationalCostDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    cost_type: "fuel" as "fuel" | "food" | "maintenance" | "other",
    amount: "" as string | number,
    description: "",
    liters: "" as string | number | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const amount = formData.amount ? parseFloat(String(formData.amount)) : 0
    const liters = formData.liters ? parseFloat(String(formData.liters)) : null
    
    if (isNaN(amount) || (liters !== null && isNaN(liters))) {
      setLoading(false)
      return
    }

    await addOperationalCost({
      trip_id: tripId,
      cost_type: formData.cost_type,
      amount,
      description: formData.description || null,
      liters,
    })

    setLoading(false)
    setOpen(false)
    setFormData({
      cost_type: "fuel",
      amount: "",
      description: "",
      liters: null,
    })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Custo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Custo Operacional</DialogTitle>
          <DialogDescription>
            Registre um custo operacional desta viagem
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cost_type">Tipo</FieldLabel>
              <Select
                value={formData.cost_type}
                onValueChange={(value: "fuel" | "food" | "maintenance" | "other") =>
                  setFormData({ ...formData, cost_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Combustivel</SelectItem>
                  <SelectItem value="food">Alimentacao</SelectItem>
                  <SelectItem value="maintenance">Manutencao</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="cost_amount">Valor (R$)</FieldLabel>
              <Input
                id="cost_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </Field>
            {formData.cost_type === "fuel" && (
              <Field>
                <FieldLabel htmlFor="liters">Litros</FieldLabel>
                <Input
                  id="liters"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.liters || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      liters: e.target.value || null,
                    })
                  }
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="description">Descricao</FieldLabel>
              <Input
                id="description"
                placeholder="Descricao do custo"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                Adicionar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
