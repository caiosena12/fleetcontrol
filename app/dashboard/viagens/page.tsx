import { DashboardHeader } from "@/components/dashboard-header"
import { TripFormDialog, EditTripButton } from "@/components/trip-form-dialog"
import { DeleteTripDialog } from "@/components/delete-trip-dialog"
import { getTrips } from "./actions"
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
import { EmptyState } from "@/components/empty-state"
import { Eye } from "lucide-react"
import Link from "next/link"

const statusLabels = {
  in_progress: "Em Andamento",
  completed: "Concluida",
  cancelled: "Cancelada",
}

const statusVariants = {
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
} as const

export default async function ViagensPage() {
  const trips = await getTrips()

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const formatNumber = (value: number | null) => {
    if (value === null) return "-"
    return new Intl.NumberFormat("pt-BR").format(value)
  }

  return (
    <>
      <DashboardHeader
        title="Viagens"
        description="Gerencie as viagens da sua frota"
      >
        <TripFormDialog />
      </DashboardHeader>
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Historico de Viagens</CardTitle>
            <CardDescription>
              {trips.length} viagem(s) registrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <EmptyState
                iconName="route"
                title="Nenhuma viagem registrada"
                description="Comece registrando sua primeira viagem para iniciar o controle financeiro."
              >
                <TripFormDialog />
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhao</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Data Inicio</TableHead>
                    <TableHead>Km Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.truck?.plate || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{trip.origin}</span>
                        {" → "}
                        <span>{trip.destination}</span>
                      </TableCell>
                      <TableCell>{formatDate(trip.start_date)}</TableCell>
                      <TableCell>{formatNumber(trip.km_total)} km</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[trip.status]}>
                          {statusLabels[trip.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/viagens/${trip.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <EditTripButton trip={trip} />
                          <DeleteTripDialog
                            tripId={trip.id}
                            route={`${trip.origin} → ${trip.destination}`}
                          />
                        </div>
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
