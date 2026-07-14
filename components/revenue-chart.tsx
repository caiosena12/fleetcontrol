"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import type { MonthlyData } from "@/lib/types"
import { formatCompactCurrency } from "@/lib/formatters"

interface RevenueChartProps {
  data: MonthlyData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Receitas vs Custos</CardTitle>
        <CardDescription>Comparativo mensal dos ultimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => formatCompactCurrency(value)}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Receita"
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="costs" 
                name="Custos"
                fill="#f97316" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="profit" 
                name="Lucro"
                fill="#22c55e" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
