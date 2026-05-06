import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Trip, Truck } from "@/lib/types"

async function getReportData() {
  const supabase = await createClient()

  // Get all trips with related data
  const { data: trips } = await supabase
    .from("trips")
    .select(`
      *,
      truck:trucks (*),
      freights (*),
      tolls (*),
      operational_costs (*)
    `)
    .order("start_date", { ascending: false })

  // Get truck stats
  const { data: trucks } = await supabase
    .from("trucks")
    .select("*")

  return { trips: trips || [], trucks: trucks || [] }
}

export default async function RelatoriosPage() {
  const { trips, trucks } = await getReportData()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  // Calculate trip profitability
  const tripProfitability = trips.map((trip: Trip) => {
    const revenue = (trip.freights || []).reduce(
      (sum, f) => sum + Number(f.amount),
      0
    )
    const tollCosts = (trip.tolls || []).reduce(
      (sum, t) => sum + Number(t.amount),
      0
    )
    const operationalCosts = (trip.operational_costs || []).reduce(
      (sum, c) => sum + Number(c.amount),
      0
    )
    const totalCosts = tollCosts + operationalCosts
    const profit = revenue - totalCosts
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    return {
      ...trip,
      revenue,
      totalCosts,
      profit,
      margin,
    }
  })

  // Calculate truck performance
  const truckPerformance = trucks.map((truck: Truck) => {
    const truckTrips = tripProfitability.filter(
      (t) => t.truck_id === truck.id
    )
    const totalTrips = truckTrips.length
    const totalRevenue = truckTrips.reduce((sum, t) => sum + t.revenue, 0)
    const totalCosts = truckTrips.reduce((sum, t) => sum + t.totalCosts, 0)
    const totalProfit = truckTrips.reduce((sum, t) => sum + t.profit, 0)
    const totalKm = truckTrips.reduce(
      (sum, t) => sum + (Number(t.km_total) || 0),
      0
    )
    const avgMargin =
      totalTrips > 0
        ? truckTrips.reduce((sum, t) => sum + t.margin, 0) / totalTrips
        : 0

    return {
      ...truck,
      totalTrips,
      totalRevenue,
      totalCosts,
      totalProfit,
      totalKm,
      avgMargin,
      profitPerKm: totalKm > 0 ? totalProfit / totalKm : 0,
    }
  })

  // Totals
  const totals = tripProfitability.reduce(
    (acc, trip) => ({
      revenue: acc.revenue + trip.revenue,
      costs: acc.costs + trip.totalCosts,
      profit: acc.profit + trip.profit,
      km: acc.km + (Number(trip.km_total) || 0),
    }),
    { revenue: 0, costs: 0, profit: 0, km: 0 }
  )

  const avgMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0

  return (
    <>
      <DashboardHeader
        title="Relatorios"
        description="Analise detalhada da performance da frota"
      />
      <main className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(totals.revenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Custos Totais</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(totals.costs)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Lucro Total</p>
              <p
                className={`text-2xl font-bold ${
                  totals.profit >= 0 ? "text-accent" : "text-destructive"
                }`}
              >
                {formatCurrency(totals.profit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Margem Media</p>
              <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Truck Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance por Caminhao</CardTitle>
            <CardDescription>
              Analise de rentabilidade de cada veiculo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {truckPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum caminhao cadastrado
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhao</TableHead>
                    <TableHead>Viagens</TableHead>
                    <TableHead>Km Total</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Custos</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>R$/Km</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {truckPerformance.map((truck) => (
                    <TableRow key={truck.id}>
                      <TableCell className="font-medium">
                        {truck.plate}
                        <span className="text-muted-foreground ml-2">
                          {truck.model}
                        </span>
                      </TableCell>
                      <TableCell>{truck.totalTrips}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-BR").format(truck.totalKm)} km
                      </TableCell>
                      <TableCell className="text-accent">
                        {formatCurrency(truck.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-destructive">
                        {formatCurrency(truck.totalCosts)}
                      </TableCell>
                      <TableCell
                        className={
                          truck.totalProfit >= 0
                            ? "text-accent"
                            : "text-destructive"
                        }
                      >
                        {formatCurrency(truck.totalProfit)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            truck.avgMargin >= 20 ? "default" : "secondary"
                          }
                        >
                          {truck.avgMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(truck.profitPerKm)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Trip Profitability */}
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade por Viagem</CardTitle>
            <CardDescription>
              Detalhamento financeiro de cada viagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tripProfitability.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma viagem registrada
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhao</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Custos</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tripProfitability.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.truck?.plate || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {trip.origin}
                        </span>
                        {" → "}
                        <span>{trip.destination}</span>
                      </TableCell>
                      <TableCell>{formatDate(trip.start_date)}</TableCell>
                      <TableCell className="text-accent">
                        {formatCurrency(trip.revenue)}
                      </TableCell>
                      <TableCell className="text-destructive">
                        {formatCurrency(trip.totalCosts)}
                      </TableCell>
                      <TableCell
                        className={
                          trip.profit >= 0 ? "text-accent" : "text-destructive"
                        }
                      >
                        {formatCurrency(trip.profit)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={trip.margin >= 20 ? "default" : "secondary"}
                        >
                          {trip.margin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
