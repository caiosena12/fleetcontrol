export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
  }).format(value)
}

export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`
}

export function formatFuelEfficiency(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-"

  return `${formatNumber(value, 2)} km/L`
}

export function formatCurrencyPerUnit(value: number, suffix: string): string {
  if (!Number.isFinite(value) || value <= 0) return "-"

  return `${formatCurrency(value)}/${suffix}`
}
