import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

export function getOccupancyRate(currentOccupants: number, capacity: number): number {
  return capacity > 0 ? (currentOccupants / capacity) * 100 : 0
}

export function getOccupancyColor(occupancyRate: number): string {
  if (occupancyRate > 100) return 'text-red-600'
  if (occupancyRate >= 90) return 'text-yellow-600'
  if (occupancyRate >= 70) return 'text-blue-600'
  return 'text-green-600'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}
