"use client"

import { Truck, Route } from "lucide-react"
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyContent 
} from "@/components/ui/empty"

const iconMap = {
  truck: Truck,
  route: Route,
} as const

type IconName = keyof typeof iconMap

interface EmptyStateProps {
  iconName: IconName
  title: string
  description: string
  children?: React.ReactNode
}

export function EmptyState({ iconName, title, description, children }: EmptyStateProps) {
  const Icon = iconMap[iconName]
  
  return (
    <Empty className="border-2 py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="h-5 w-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}
