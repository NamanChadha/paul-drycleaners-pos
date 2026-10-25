import { addDays, format, isSunday, parseISO } from 'date-fns'

export const todayIso = () => format(new Date(), 'yyyy-MM-dd')

export function calculateDeliveryDate(offsetDays: number, sundayClosed: boolean) {
  let date = addDays(new Date(), offsetDays)
  if (sundayClosed && isSunday(date)) date = addDays(date, 1)
  return format(date, 'yyyy-MM-dd')
}

export function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    const d = value.includes('T') ? parseISO(value) : parseISO(value.slice(0, 10))
    return format(d, 'dd MMM yyyy')
  } catch {
    return value
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) return ''
  try {
    const d = value.includes('T') ? parseISO(value) : new Date(value)
    if (isNaN(d.getTime())) return value
    return format(d, 'dd MMM yyyy, hh:mm a')
  } catch {
    return value
  }
}

export function formatTime(value?: string | null) {
  if (!value) return ''
  try {
    const d = value.includes('T') ? parseISO(value) : new Date(value)
    if (isNaN(d.getTime())) return value
    return format(d, 'hh:mm a')
  } catch {
    return value
  }
}

