"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Trash2 } from "lucide-react"
import {
  deleteFreight,
  deleteToll,
  deleteOperationalCost,
} from "@/app/dashboard/viagens/actions"

interface DeleteItemButtonProps {
  itemId: string
  itemType: "freight" | "toll" | "operationalCost"
}

export function DeleteItemButton({ itemId, itemType }: DeleteItemButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    switch (itemType) {
      case "freight":
        await deleteFreight(itemId)
        break
      case "toll":
        await deleteToll(itemId)
        break
      case "operationalCost":
        await deleteOperationalCost(itemId)
        break
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
