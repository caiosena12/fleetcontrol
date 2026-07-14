type AmountRecord = {
  amount?: number | string | null
}

type OperationalCostRecord = AmountRecord & {
  cost_type?: string | null
  liters?: number | string | null
}

export type TripCalculationInput = {
  freights?: AmountRecord[] | null
  tolls?: AmountRecord[] | null
  operational_costs?: OperationalCostRecord[] | null
  km_total?: number | string | null
  km_start?: number | string | null
  km_end?: number | string | null
  empty_km?: number | string | null
  empty_fuel_liters?: number | string | null
  empty_fuel_cost?: number | string | null
}

export type TripMetrics = {
  revenue: number
  tollCosts: number
  operationalCosts: number
  fuelCosts: number
  emptyFuelCost: number
  totalFuelCost: number
  totalCosts: number
  profit: number
  margin: number
  loadedKm: number
  emptyKm: number
  totalKm: number
  fuelLiters: number
  emptyFuelLiters: number
  totalFuelLiters: number
  averageFuelPrice: number
  averageConsumption: number
  emptyConsumption: number
  emptyKmPercentage: number
  costPerKm: number
  profitPerKm: number
}

export type TripMetricSummary = {
  revenue: number
  costs: number
  profit: number
  margin: number
  loadedKm: number
  emptyKm: number
  totalKm: number
  fuelLiters: number
  emptyFuelLiters: number
  totalFuelLiters: number
  averageFuelPrice: number
  averageConsumption: number
  emptyConsumption: number
  emptyKmPercentage: number
  costPerKm: number
  profitPerKm: number
}

export type AggregateMetrics = Omit<
  TripMetrics,
  "margin" | "averageFuelPrice" | "averageConsumption" | "emptyConsumption" | "emptyKmPercentage" | "costPerKm" | "profitPerKm"
> & {
  margin: number
  averageFuelPrice: number
  averageConsumption: number
  emptyConsumption: number
  emptyKmPercentage: number
  costPerKm: number
  profitPerKm: number
}

function toNumber(value: number | string | null | undefined): number {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function sumAmounts(records: AmountRecord[] | null | undefined): number {
  return (records || []).reduce((sum, record) => sum + toNumber(record.amount), 0)
}

function sumFuelCosts(records: OperationalCostRecord[] | null | undefined): number {
  return (records || []).reduce((sum, record) => {
    if (record.cost_type !== "fuel") return sum
    return sum + toNumber(record.amount)
  }, 0)
}

function sumFuelLiters(records: OperationalCostRecord[] | null | undefined): number {
  return (records || []).reduce((sum, record) => {
    if (record.cost_type !== "fuel") return sum
    return sum + toNumber(record.liters)
  }, 0)
}

function divideOrZero(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0
}

export function calculateProfit(revenue: number, costs: number): number {
  return revenue - costs
}

export function calculateMargin(revenue: number, profit: number): number {
  return revenue > 0 ? (profit / revenue) * 100 : 0
}

export function calculateAverageFuelPrice(totalFuelCost: number, totalFuelLiters: number): number {
  return divideOrZero(totalFuelCost, totalFuelLiters)
}

export function calculateAverageConsumption(totalKm: number, totalFuelLiters: number): number {
  return divideOrZero(totalKm, totalFuelLiters)
}

export function calculateCostPerKm(totalCosts: number, totalKm: number): number {
  return divideOrZero(totalCosts, totalKm)
}

export function calculateTripMetrics(trip: TripCalculationInput): TripMetrics {
  const revenue = sumAmounts(trip.freights)
  const tollCosts = sumAmounts(trip.tolls)
  const operationalCosts = sumAmounts(trip.operational_costs)
  const fuelCosts = sumFuelCosts(trip.operational_costs)
  const emptyFuelCost = toNumber(trip.empty_fuel_cost)
  const totalFuelCost = fuelCosts + emptyFuelCost
  const totalCosts = tollCosts + operationalCosts + emptyFuelCost
  const profit = calculateProfit(revenue, totalCosts)

  const kmTotal = toNumber(trip.km_total)
  const kmStart = toNumber(trip.km_start)
  const kmEnd = toNumber(trip.km_end)
  const inferredLoadedKm = kmStart > 0 && kmEnd > 0 && kmEnd >= kmStart ? kmEnd - kmStart : 0
  const loadedKm = kmTotal > 0 ? kmTotal : inferredLoadedKm
  const emptyKm = toNumber(trip.empty_km)
  const totalKm = loadedKm + emptyKm
  const fuelLiters = sumFuelLiters(trip.operational_costs)
  const emptyFuelLiters = toNumber(trip.empty_fuel_liters)
  const totalFuelLiters = fuelLiters + emptyFuelLiters

  return {
    revenue,
    tollCosts,
    operationalCosts,
    fuelCosts,
    emptyFuelCost,
    totalFuelCost,
    totalCosts,
    profit,
    margin: calculateMargin(revenue, profit),
    loadedKm,
    emptyKm,
    totalKm,
    fuelLiters,
    emptyFuelLiters,
    totalFuelLiters,
    averageFuelPrice: calculateAverageFuelPrice(totalFuelCost, totalFuelLiters),
    averageConsumption: calculateAverageConsumption(totalKm, totalFuelLiters),
    emptyConsumption: divideOrZero(emptyKm, emptyFuelLiters),
    emptyKmPercentage: totalKm > 0 ? (emptyKm / totalKm) * 100 : 0,
    costPerKm: calculateCostPerKm(totalCosts, totalKm),
    profitPerKm: divideOrZero(profit, totalKm),
  }
}

export function calculateAggregateMetrics(metrics: TripMetrics[]): AggregateMetrics {
  const totals = metrics.reduce(
    (acc, trip) => ({
      revenue: acc.revenue + trip.revenue,
      tollCosts: acc.tollCosts + trip.tollCosts,
      operationalCosts: acc.operationalCosts + trip.operationalCosts,
      fuelCosts: acc.fuelCosts + trip.fuelCosts,
      emptyFuelCost: acc.emptyFuelCost + trip.emptyFuelCost,
      totalFuelCost: acc.totalFuelCost + trip.totalFuelCost,
      totalCosts: acc.totalCosts + trip.totalCosts,
      profit: acc.profit + trip.profit,
      loadedKm: acc.loadedKm + trip.loadedKm,
      emptyKm: acc.emptyKm + trip.emptyKm,
      totalKm: acc.totalKm + trip.totalKm,
      fuelLiters: acc.fuelLiters + trip.fuelLiters,
      emptyFuelLiters: acc.emptyFuelLiters + trip.emptyFuelLiters,
      totalFuelLiters: acc.totalFuelLiters + trip.totalFuelLiters,
    }),
    {
      revenue: 0,
      tollCosts: 0,
      operationalCosts: 0,
      fuelCosts: 0,
      emptyFuelCost: 0,
      totalFuelCost: 0,
      totalCosts: 0,
      profit: 0,
      loadedKm: 0,
      emptyKm: 0,
      totalKm: 0,
      fuelLiters: 0,
      emptyFuelLiters: 0,
      totalFuelLiters: 0,
    }
  )

  return {
    ...totals,
    margin: calculateMargin(totals.revenue, totals.profit),
    averageFuelPrice: calculateAverageFuelPrice(totals.totalFuelCost, totals.totalFuelLiters),
    averageConsumption: calculateAverageConsumption(totals.totalKm, totals.totalFuelLiters),
    emptyConsumption: divideOrZero(totals.emptyKm, totals.emptyFuelLiters),
    emptyKmPercentage: totals.totalKm > 0 ? (totals.emptyKm / totals.totalKm) * 100 : 0,
    costPerKm: calculateCostPerKm(totals.totalCosts, totals.totalKm),
    profitPerKm: divideOrZero(totals.profit, totals.totalKm),
  }
}

export function summarizeTripMetrics(trip: TripCalculationInput): TripMetricSummary {
  const metrics = calculateTripMetrics(trip)

  return {
    revenue: metrics.revenue,
    costs: metrics.totalCosts,
    profit: metrics.profit,
    margin: metrics.margin,
    loadedKm: metrics.loadedKm,
    emptyKm: metrics.emptyKm,
    totalKm: metrics.totalKm,
    fuelLiters: metrics.fuelLiters,
    emptyFuelLiters: metrics.emptyFuelLiters,
    totalFuelLiters: metrics.totalFuelLiters,
    averageFuelPrice: metrics.averageFuelPrice,
    averageConsumption: metrics.averageConsumption,
    emptyConsumption: metrics.emptyConsumption,
    emptyKmPercentage: metrics.emptyKmPercentage,
    costPerKm: metrics.costPerKm,
    profitPerKm: metrics.profitPerKm,
  }
}
