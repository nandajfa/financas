import type { User } from '@supabase/supabase-js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTransactionDate(dateValue?: string | Date | null) {
  if (!dateValue) return null

  if (dateValue instanceof Date) return dateValue

  const trimmed = dateValue.trim()

  // Handle dates coming in the format "DD/MM/YYYY HH:mm" or "DD/MM/YYYY"
  const match = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  )

  if (match) {
    const [, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match
    const day = Number.parseInt(dayStr, 10)
    const month = Number.parseInt(monthStr, 10) - 1
    const year = Number.parseInt(yearStr, 10)
    const hour = hourStr ? Number.parseInt(hourStr, 10) : 0
    const minute = minuteStr ? Number.parseInt(minuteStr, 10) : 0
    const second = secondStr ? Number.parseInt(secondStr, 10) : 0

    const parsed = new Date(year, month, day, hour, minute, second)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  const fallback = new Date(trimmed)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function getUserIdentifier(user?: User | null) {
  if (!user) {
    return null
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const metadataFields = [
    'whatsapp',
    'whatsapp_id',
    'wa_id',
    'whatsappNumber',
    'phone',
    'phoneNumber',
    'phone_number',
    'user',
    'user_id'
  ]

  for (const field of metadataFields) {
    const value = metadata[field]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  if (typeof user.phone === 'string' && user.phone.trim()) {
    return user.phone
  }

  if (typeof user.email === 'string' && user.email.trim()) {
    return user.email
  }

  return null
}
