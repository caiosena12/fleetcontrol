"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { CostBreakdown } from "@/lib/types"

interface CostBreakdownChartProps {
  data: CostBreakdown[]
}

const COLORS = [
  "#3b82f6", // Azul - Combustível
  "#f97316", // Laranja - Pedágios
  "#8b5cf6", // Roxo - Manutenção
  "#ec4899", // Rosa - Alimentação
  "#6b7280", // Cinza - Outros
]

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuicao de Custos</CardTitle>
          <CardDescription>Por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum custo registrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuicao de Custos</CardTitle>
        <CardDescription>Por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                nameKey="type"
                label={({ type, percentage }) => `${type} (${percentage.toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
