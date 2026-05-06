import { DashboardHeader } from "@/components/dashboard-header"
import { TruckFormDialog, EditTruckButton } from "@/components/truck-form-dialog"
import { DeleteTruckDialog } from "@/components/delete-truck-dialog"
import { getTrucks } from "./actions"
import { Badge } from "@/components/ui/badge"
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

export default async function CaminhoesPage() {
  const trucks = await getTrucks()

  return (
    <>
      <DashboardHeader
        title="Caminhoes"
        description="Gerencie sua frota de caminhoes"
      >
        <TruckFormDialog />
      </DashboardHeader>
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Frota</CardTitle>
            <CardDescription>
              {trucks.length} caminhao(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trucks.length === 0 ? (
              <EmptyState
                iconName="truck"
                title="Nenhum caminhao cadastrado"
                description="Comece cadastrando seu primeiro caminhao para iniciar o controle da frota."
              >
                <TruckFormDialog />
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Consumo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trucks.map((truck) => (
                    <TableRow key={truck.id}>
                      <TableCell className="font-medium">{truck.plate}</TableCell>
                      <TableCell>{truck.model}</TableCell>
                      <TableCell>{truck.year}</TableCell>
                      <TableCell>{truck.avg_consumption} km/l</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            truck.status === "active" ? "default" : "secondary"
                          }
                        >
                          {truck.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <EditTruckButton truck={truck} />
                          <DeleteTruckDialog
                            truckId={truck.id}
                            truckPlate={truck.plate}
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
