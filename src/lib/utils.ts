import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 12)
}

export function formatTimestamp(timestamp: number, currentTime?: number): string {
  const now = currentTime || Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  
  return new Date(timestamp).toLocaleDateString()
}

export function formatExpirationTime(timestamp: number, currentTime?: number): string {
  const now = currentTime || Date.now()
  const diff = timestamp - now
  
  // If already expired
  if (diff <= 0) return 'expired'
  
  // Less than a minute
  if (diff < 60000) return 'in less than 1m'
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `in ${minutes}m`
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`
  }
  
  // Days
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return hours > 0 ? `in ${days}d ${hours}h` : `in ${days}d`
}

export function getExpirationDate(expiry: string): Date | null {
  const now = new Date()
  
  switch (expiry) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    case 'never':
      return null
    default:
      return null
  }
}

export function isExpired(expiresAt: Date | number | null): boolean {
  if (!expiresAt) return false
  const expirationTime = typeof expiresAt === 'number' ? expiresAt : expiresAt.getTime()
  return Date.now() > expirationTime
}
