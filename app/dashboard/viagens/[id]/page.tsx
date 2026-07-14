import { notFound } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { getTrip } from "../actions"
import {
  AddFreightDialog,
  AddTollDialog,
  AddOperationalCostDialog,
} from "@/components/add-cost-dialogs"
import { DeleteItemButton } from "@/components/delete-item-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Truck, MapPin, Calendar, Gauge } from "lucide-react"
import type { Freight, Toll, OperationalCost } from "@/lib/types"
import { formatDateOnly } from "@/lib/date-utils"
import {
  formatCurrency,
  formatCurrencyPerUnit,
  formatFuelEfficiency,
  formatNumber,
  formatPercent,
} from "@/lib/formatters"
import { calculateTripMetrics } from "@/lib/trip-calculations"

const statusLabels = {
  in_progress: "Em Andamento",
  completed: "Concluida",
  cancelled: "Cancelada",
}

const costTypeLabels = {
  fuel: "Combustivel",
  food: "Alimentacao",
  maintenance: "Manutencao",
  other: "Outros",
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await getTrip(id)

  if (!trip) {
    notFound()
  }

  const metrics = calculateTripMetrics(trip)
  const totalFreight = metrics.revenue
  const totalTolls = metrics.tollCosts
  const totalOperationalCosts = metrics.operationalCosts
  const totalCosts = metrics.totalCosts
  const profit = metrics.profit
  const margin = metrics.margin

  return (
    <>
      <DashboardHeader
        title="Detalhes da Viagem"
        description={`${trip.origin} → ${trip.destination}`}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/viagens">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </DashboardHeader>
      <main className="flex-1 overflow-auto p-6">
        {/* Trip Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Caminhao</p>
                  <p className="font-semibold">
                    {trip.truck?.plate || "-"} - {trip.truck?.model || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rota</p>
                  <p className="font-semibold">
                    {trip.origin} → {trip.destination}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Periodo</p>
                  <p className="font-semibold">
                    {formatDateOnly(trip.start_date)} - {formatDateOnly(trip.end_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Km Total</p>
                  <p className="font-semibold">{formatNumber(metrics.totalKm)} km</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(metrics.loadedKm)} carregado / {formatNumber(metrics.emptyKm)} vazio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>
              Status:{" "}
              <Badge
                variant={
                  trip.status === "completed"
                    ? "secondary"
                    : trip.status === "cancelled"
                    ? "destructive"
                    : "default"
                }
              >
                {statusLabels[trip.status]}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-lg bg-accent/10 p-4">
                <p className="text-sm text-muted-foreground">Receita (Fretes)</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(totalFreight)}
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm text-muted-foreground">Custos Totais</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalCosts)}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Rodado Vazio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.emptyFuelCost)}
                </p>
              </div>
              <div
                className={`rounded-lg p-4 ${
                  profit >= 0 ? "bg-accent/10" : "bg-destructive/10"
                }`}
              >
                <p className="text-sm text-muted-foreground">Lucro</p>
                <p
                  className={`text-2xl font-bold ${
                    profit >= 0 ? "text-accent" : "text-destructive"
                  }`}
                >
                  {formatCurrency(profit)}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Margem</p>
                <p className="text-2xl font-bold">{margin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Indicadores de Eficiencia</CardTitle>
            <CardDescription>
              Consumo, combustivel e participacao do deslocamento vazio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Litros Totais</p>
                <p className="text-xl font-semibold">{formatNumber(metrics.totalFuelLiters, 2)} L</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Preco Medio/L</p>
                <p className="text-xl font-semibold">{formatCurrencyPerUnit(metrics.averageFuelPrice, "L")}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Consumo Medio</p>
                <p className="text-xl font-semibold">{formatFuelEfficiency(metrics.averageConsumption)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Consumo Vazio</p>
                <p className="text-xl font-semibold">{formatFuelEfficiency(metrics.emptyConsumption)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">KM Vazio</p>
                <p className="text-xl font-semibold">{formatPercent(metrics.emptyKmPercentage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Freights */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fretes</CardTitle>
                <CardDescription>
                  Total: {formatCurrency(totalFreight)}
                </CardDescription>
              </div>
              <AddFreightDialog tripId={trip.id} />
            </CardHeader>
            <CardContent>
              {(trip.freights || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum frete registrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Carga</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trip.freights as Freight[]).map((freight) => (
                      <TableRow key={freight.id}>
                        <TableCell>{freight.client || "-"}</TableCell>
                        <TableCell>{freight.cargo_type || "-"}</TableCell>
                        <TableCell>{formatCurrency(Number(freight.amount))}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              freight.status === "received"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {freight.status === "received"
                              ? "Recebido"
                              : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DeleteItemButton
                            itemId={freight.id}
                            itemType="freight"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Tolls */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pedagios</CardTitle>
                <CardDescription>
                  Total: {formatCurrency(totalTolls)}
                </CardDescription>
              </div>
              <AddTollDialog tripId={trip.id} />
            </CardHeader>
            <CardContent>
              {(trip.tolls || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pedagio registrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trip.tolls as Toll[]).map((toll) => (
                      <TableRow key={toll.id}>
                        <TableCell>{toll.location}</TableCell>
                        <TableCell>{formatDateOnly(toll.toll_date)}</TableCell>
                        <TableCell>{formatCurrency(Number(toll.amount))}</TableCell>
                        <TableCell>
                          <DeleteItemButton itemId={toll.id} itemType="toll" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Operational Costs */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Custos Operacionais</CardTitle>
                <CardDescription>
                  Total: {formatCurrency(totalOperationalCosts)}
                </CardDescription>
              </div>
              <AddOperationalCostDialog
                tripId={trip.id}
                emptyFuelCost={metrics.emptyFuelCost}
              />
            </CardHeader>
            <CardContent>
              {(trip.operational_costs || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum custo operacional registrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead>Litros</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trip.operational_costs as OperationalCost[]).map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {costTypeLabels[cost.cost_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>{cost.description || "-"}</TableCell>
                        <TableCell>
                          {cost.liters ? `${cost.liters} L` : "-"}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(cost.amount))}</TableCell>
                        <TableCell>
                          <DeleteItemButton
                            itemId={cost.id}
                            itemType="operationalCost"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
