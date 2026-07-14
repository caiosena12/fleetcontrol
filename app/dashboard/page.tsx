import { DashboardHeader } from "@/components/dashboard-header"
import { KPICard } from "@/components/kpi-card"
import { RevenueChart } from "@/components/revenue-chart"
import { CostBreakdownChart } from "@/components/cost-breakdown-chart"
import { RecentTripsTable } from "@/components/recent-trips-table"
import {
  getDashboardStats,
  getMonthlyData,
  getCostBreakdown,
  getRecentTrips,
} from "./actions"
import {
  formatCurrency,
  formatCurrencyPerUnit,
  formatFuelEfficiency,
  formatNumber,
  formatPercent,
} from "@/lib/formatters"

export default async function DashboardPage() {
  const [stats, monthlyData, costBreakdown, recentTrips] = await Promise.all([
    getDashboardStats(),
    getMonthlyData(),
    getCostBreakdown(),
    getRecentTrips(),
  ])

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Visao geral do desempenho da sua frota"
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KPICard
            title="Receita Total"
            value={formatCurrency(stats.totalRevenue)}
            iconName="dollar-sign"
            variant="success"
            description="Total de fretes recebidos"
          />
          <KPICard
            title="Custos Totais"
            value={formatCurrency(stats.totalCosts)}
            iconName="trending-up"
            variant="danger"
            description="Combustivel, pedagios, etc."
          />
          <KPICard
            title="Lucro"
            value={formatCurrency(stats.profit)}
            iconName="trending-up"
            variant={stats.profit >= 0 ? "success" : "danger"}
            description="Receita - Custos"
          />
          <KPICard
            title="Margem"
            value={`${stats.margin.toFixed(1)}%`}
            iconName="percent"
            variant={stats.margin >= 20 ? "success" : "warning"}
            description="Margem de lucro"
          />
          <KPICard
            title="Caminhoes"
            value={`${stats.activeTrucks}/${stats.totalTrucks}`}
            iconName="truck"
            description="Ativos / Total"
          />
          <KPICard
            title="Km Rodados"
            value={formatNumber(stats.totalKm)}
            iconName="gauge"
            description={`${formatNumber(stats.loadedKm)} carregado / ${formatNumber(stats.emptyKm)} vazio`}
          />
          <KPICard
            title="Litros"
            value={formatNumber(stats.totalFuelLiters, 2)}
            iconName="gauge"
            description="Combustivel total registrado"
          />
          <KPICard
            title="Consumo Medio"
            value={formatFuelEfficiency(stats.avgConsumption)}
            iconName="gauge"
            description="Km total / litros totais"
          />
          <KPICard
            title="Preco Medio/L"
            value={formatCurrencyPerUnit(stats.avgFuelPrice, "L")}
            iconName="dollar-sign"
            description="Custo combustivel / litros"
          />
          <KPICard
            title="Custo/Km"
            value={formatCurrencyPerUnit(stats.costPerKm, "km")}
            iconName="trending-up"
            variant="warning"
            description={`${formatPercent(stats.emptyKmPercentage)} do km em vazio`}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <RevenueChart data={monthlyData} />
          <CostBreakdownChart data={costBreakdown} />
        </div>

        <div className="mt-6">
          <RecentTripsTable trips={recentTrips} />
        </div>
      </main>
    </>
  )
}
