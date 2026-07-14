const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}/

export function toDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getTodayDateOnly(): string {
  return toDateOnly(new Date())
}

export function parseDateOnly(dateString: string | null | undefined): Date | null {
  if (!dateString) return null

  const normalized = dateString.trim()
  const match = DATE_ONLY_PATTERN.exec(normalized)
  if (!match) return null

  const [year, month, day] = match[0].split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

export function formatDateOnly(
  dateString: string | null | undefined,
  fallback = "-"
): string {
  const date = parseDateOnly(dateString)
  if (!date) return fallback

  return new Intl.DateTimeFormat("pt-BR").format(date)
}

export function formatMonthYear(
  value: Date | string | null | undefined,
  fallback = "-"
): string {
  const date = value instanceof Date ? value : parseDateOnly(value)
  if (!date) return fallback

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(date)
}
