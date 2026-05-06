"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  DollarSign,
  TrendingUp,
  Truck,
  Route,
  Gauge,
  Percent,
} from "lucide-react"

const iconMap = {
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  truck: Truck,
  route: Route,
  gauge: Gauge,
  percent: Percent,
} as const

type IconName = keyof typeof iconMap

interface KPICardProps {
  title: string
  value: string
  description?: string
  iconName: IconName
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger"
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-accent/10 text-accent",
  warning: "bg-chart-4/20 text-chart-4",
  danger: "bg-destructive/10 text-destructive",
}

export function KPICard({
  title,
  value,
  description,
  iconName,
  trend,
  variant = "default",
}: KPICardProps) {
  const Icon = iconMap[iconName]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", variantStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-accent" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%{" "}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
