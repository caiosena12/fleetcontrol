"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { Trash2 } from "lucide-react"
import { deleteTruck, type TruckActionResult } from "@/app/dashboard/caminhoes/actions"

interface DeleteTruckDialogProps {
  truckId: string
  truckPlate: string
}

export function DeleteTruckDialog({ truckId, truckPlate }: DeleteTruckDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setError(null)
    setLoading(true)
    try {
      const result: TruckActionResult = await deleteTruck(truckId)
      
      if ("error" in result) {
        setError(result.error)
        setLoading(false)
        return
      }

      setLoading(false)
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error("Error deleting truck:", err)
      setError("Erro inesperado ao excluir caminhao")
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir caminhao</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o caminhao {truckPlate}? Esta acao nao
            pode ser desfeita e todas as viagens associadas serao excluidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            {loading ? <Spinner className="mr-2" /> : null}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
