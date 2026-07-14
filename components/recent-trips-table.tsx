"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { formatDateOnly } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/formatters"

interface TripWithDetails {
  id: string
  origin: string
  destination: string
  start_date: string
  status: "in_progress" | "completed" | "cancelled"
  truck: { plate: string; model: string } | null
  freights: { amount: number }[]
}

interface RecentTripsTableProps {
  trips: TripWithDetails[]
}

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

export function RecentTripsTable({ trips }: RecentTripsTableProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Viagens Recentes</CardTitle>
          <CardDescription>Ultimas 5 viagens registradas</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/viagens">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            Nenhuma viagem registrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caminhao</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Frete</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => {
                const totalFreight = trip.freights?.reduce(
                  (sum, f) => sum + Number(f.amount),
                  0
                ) || 0

                return (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      {trip.truck?.plate || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{trip.origin}</span>
                      {" → "}
                      <span>{trip.destination}</span>
                    </TableCell>
                    <TableCell>{formatDateOnly(trip.start_date)}</TableCell>
                    <TableCell>{formatCurrency(totalFreight)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[trip.status]}>
                        {statusLabels[trip.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
