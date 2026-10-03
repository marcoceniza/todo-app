import type { Priority } from '../types/todo'

export interface CategoryMeta {
  key: string
  label: string
  badgeClass: string
  iconName: string
}

export const DEFAULT_CATEGORIES: CategoryMeta[] = [
  {
    key: 'work',
    label: 'Work',
    badgeClass:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    iconName: 'Briefcase',
  },
  {
    key: 'personal',
    label: 'Personal',
    badgeClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconName: 'User',
  },
  {
    key: 'study',
    label: 'Study',
    badgeClass:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    iconName: 'BookOpen',
  },
  {
    key: 'shopping',
    label: 'Shopping',
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconName: 'ShoppingCart',
  },
  {
    key: 'health',
    label: 'Health',
    badgeClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    iconName: 'HeartPulse',
  },
  {
    key: 'other',
    label: 'Other',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    iconName: 'Bookmark',
  },
]

export function getCategoryMeta(
  key: string,
  categoriesList?: { key: string; label: string }[],
): CategoryMeta {
  const normalized = key.toLowerCase()
  const foundDefault = DEFAULT_CATEGORIES.find((c) => c.key === normalized)
  if (foundDefault) return foundDefault

  // Check if present in custom categories list
  const foundCustom = categoriesList?.find(
    (c) => c.key === normalized || c.label.toLowerCase() === normalized,
  )
  const displayLabel = foundCustom ? foundCustom.label : key.charAt(0).toUpperCase() + key.slice(1)

  return {
    key: normalized,
    label: displayLabel,
    badgeClass:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    iconName: 'Tag',
  }
}

export interface PriorityMeta {
  key: Priority
  label: string
  badgeClass: string
  dotColor: string
}

export const PRIORITIES: PriorityMeta[] = [
  {
    key: 'urgent',
    label: 'Urgent',
    badgeClass:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60',
    dotColor: 'bg-red-500',
  },
  {
    key: 'high',
    label: 'High',
    badgeClass:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
    dotColor: 'bg-amber-500',
  },
  {
    key: 'medium',
    label: 'Medium',
    badgeClass:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60',
    dotColor: 'bg-blue-500',
  },
  {
    key: 'low',
    label: 'Low',
    badgeClass:
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    dotColor: 'bg-slate-400',
  },
]

export function formatDueDate(dateStr?: string): {
  text: string
  status: 'overdue' | 'today' | 'tomorrow' | 'normal'
  colorClass: string
} {
  if (!dateStr) {
    return { text: '', status: 'normal', colorClass: '' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [y, m, d] = dateStr.split('-').map(Number)
  const targetDate = new Date(y!, m! - 1, d!)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      status: 'overdue',
      colorClass: 'text-red-600 dark:text-red-400 font-medium',
    }
  }
  if (diffDays === 0) {
    return {
      text: 'Today',
      status: 'today',
      colorClass: 'text-amber-600 dark:text-amber-400 font-medium',
    }
  }
  if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      status: 'tomorrow',
      colorClass: 'text-blue-600 dark:text-blue-400',
    }
  }

  return {
    text: targetDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    status: 'normal',
    colorClass: 'text-slate-500 dark:text-slate-400',
  }
}
