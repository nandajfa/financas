import type { User } from '@supabase/supabase-js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
