export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = string;

export interface CategoryItem {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export type FilterStatus = 'all' | 'active' | 'completed';

export type SortOption =
  | 'created-desc'
  | 'created-asc'
  | 'due-asc'
  | 'due-desc'
  | 'priority-desc'
  | 'title-asc';
