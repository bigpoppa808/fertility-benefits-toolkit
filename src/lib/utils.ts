import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(num: number): string {
  return `${Math.round(num * 100) / 100}%`
}

export function calculateCompanySize(employeeCount: number): string {
  if (employeeCount >= 1000) return 'Large (1000+)'
  if (employeeCount >= 250) return 'Medium (250-999)'
  return 'Small (50-249)'
}

export function getIndustryColor(industry: string): string {
  const colors: Record<string, string> = {
    'Technology': 'bg-blue-500',
    'Healthcare': 'bg-green-500',
    'Financial Services': 'bg-purple-500',
    'Manufacturing': 'bg-orange-500',
    'Retail': 'bg-pink-500',
    'Professional Services': 'bg-indigo-500',
  }
  return colors[industry] || 'bg-gray-500'
}