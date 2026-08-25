export function nowIso() {
  return new Date().toISOString()
}

export function formatDateTime(value: string) {
  if (!value) {
    return "刚刚"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatMonth(value: string) {
  if (!value) {
    return ""
  }

  const match = value.match(/^(\d{4})-(\d{2})/)

  if (!match) {
    return value
  }

  return `${match[1]}.${match[2]}`
}

export function formatDateRange(startDate: string, endDate: string, current = false) {
  const start = formatMonth(startDate)
  const end = current ? "至今" : formatMonth(endDate)

  if (start && end) {
    return `${start} - ${end}`
  }

  return start || end
}
