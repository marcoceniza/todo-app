import { ref, computed, watch, onMounted } from 'vue'
import type { Todo, FilterStatus, SortOption, Priority } from '../types/todo'
import { DEFAULT_CATEGORIES } from '../utils/todoHelpers'

const STORAGE_KEY = 'taskflow_todos_v2'
const CATEGORIES_KEY = 'taskflow_categories_v1'
const THEME_KEY = 'taskflow_theme'

export interface CategoryOption {
  key: string
  label: string
  isCustom?: boolean
}

export function useTodos() {
  const todos = ref<Todo[]>([])
  const categories = ref<CategoryOption[]>([])
  const isLoaded = ref(false)
  const filterStatus = ref<FilterStatus>('all')
  const selectedCategory = ref<string>('all')
  const searchQuery = ref('')
  const sortBy = ref<SortOption>('created-desc')
  const isDarkMode = ref(false)

  // Todo earmarked for deletion confirmation
  const todoToDelete = ref<Todo | null>(null)
  const isDeleteModalOpen = ref(false)

  // Toast feedback
  const toastMessage = ref<string | null>(null)
  let toastTimeout: ReturnType<typeof setTimeout> | null = null

  const showToast = (msg: string) => {
    toastMessage.value = msg
    if (toastTimeout) clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
      toastMessage.value = null
    }, 3000)
  }

  // Load from localStorage
  onMounted(() => {
    try {
      // 1. Load Categories
      const baseCategories: CategoryOption[] = DEFAULT_CATEGORIES.map((c) => ({
        key: c.key,
        label: c.label,
        isCustom: false,
      }))

      const savedCategories = localStorage.getItem(CATEGORIES_KEY)
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories) as CategoryOption[]
        // Merge base categories with any saved custom ones
        const customOnly = parsed.filter((p) => p.isCustom)
        categories.value = [...baseCategories, ...customOnly]
      } else {
        categories.value = baseCategories
      }

      // 2. Load Todos
      const savedTodos = localStorage.getItem(STORAGE_KEY)
      if (savedTodos) {
        todos.value = JSON.parse(savedTodos)
      } else {
        todos.value = []
      }

      // 3. Load Theme
      const savedTheme = localStorage.getItem(THEME_KEY)
      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark'
      } else {
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme(isDarkMode.value)
    } catch {
      todos.value = []
    } finally {
      isLoaded.value = true
    }
  })

  // Watch and persist todos to localStorage
  watch(
    todos,
    (newTodos) => {
      if (isLoaded.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos))
      }
    },
    { deep: true },
  )

  // Watch and persist categories to localStorage
  watch(
    categories,
    (newCategories) => {
      if (isLoaded.value) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories))
      }
    },
    { deep: true },
  )

  // Dark mode methods
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem(THEME_KEY, isDarkMode.value ? 'dark' : 'light')
    applyTheme(isDarkMode.value)
  }

  // Add custom category
  const addCategory = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) return null

    const key = trimmed.toLowerCase().replace(/\s+/g, '-')
    const existing = categories.value.find(
      (c) => c.key === key || c.label.toLowerCase() === trimmed.toLowerCase(),
    )

    if (existing) {
      showToast(`Category "${existing.label}" already exists`)
      return existing.key
    }

    const newCat: CategoryOption = {
      key,
      label: trimmed,
      isCustom: true,
    }

    categories.value.push(newCat)
    showToast(`Category "${trimmed}" created`)
    return key
  }

  // Add todo
  const addTodo = (newTodoData: {
    title: string
    description?: string
    priority: Priority
    category: string
    dueDate?: string
  }) => {
    if (!newTodoData.title.trim()) return

    const newTodo: Todo = {
      id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: newTodoData.title.trim(),
      description: newTodoData.description?.trim() || undefined,
      completed: false,
      priority: newTodoData.priority || 'medium',
      category: newTodoData.category || 'personal',
      dueDate: newTodoData.dueDate || undefined,
      createdAt: new Date().toISOString(),
    }

    todos.value.unshift(newTodo)
    showToast('Task added')
  }

  // Toggle completed
  const toggleTodo = (id: string) => {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return

    todo.completed = !todo.completed
    todo.completedAt = todo.completed ? new Date().toISOString() : undefined
  }

  // Update existing todo
  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const index = todos.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      todos.value[index] = { ...todos.value[index]!, ...updates }
      showToast('Task updated')
    }
  }

  // Request deletion (opens confirmation modal)
  const promptDeleteTodo = (todo: Todo) => {
    todoToDelete.value = todo
    isDeleteModalOpen.value = true
  }

  const cancelDelete = () => {
    todoToDelete.value = null
    isDeleteModalOpen.value = false
  }

  // Confirm delete (removes from list & localStorage)
  const confirmDelete = () => {
    if (!todoToDelete.value) return
    const id = todoToDelete.value.id
    const title = todoToDelete.value.title
    todos.value = todos.value.filter((t) => t.id !== id)
    todoToDelete.value = null
    isDeleteModalOpen.value = false
    showToast(`Deleted "${title.slice(0, 20)}${title.length > 20 ? '...' : ''}"`)
  }

  const clearCompleted = () => {
    const completedCount = todos.value.filter((t) => t.completed).length
    if (completedCount === 0) return
    todos.value = todos.value.filter((t) => !t.completed)
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`)
  }

  // Clear all data from localStorage
  const clearStorage = () => {
    todos.value = []
    categories.value = DEFAULT_CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      isCustom: false,
    }))
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CATEGORIES_KEY)
    showToast('All data cleared')
  }

  // Filtered and Sorted todos
  const filteredTodos = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()

    const priorityWeight: Record<Priority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    }

    let list = todos.value.filter((todo) => {
      // 1. Search filter
      if (q) {
        const matchesTitle = todo.title.toLowerCase().includes(q)
        const matchesDesc = todo.description?.toLowerCase().includes(q) || false
        if (!matchesTitle && !matchesDesc) {
          return false
        }
      }

      // 2. Status filter
      if (filterStatus.value === 'active' && todo.completed) return false
      if (filterStatus.value === 'completed' && !todo.completed) return false

      // 3. Category filter
      if (
        selectedCategory.value !== 'all' &&
        todo.category.toLowerCase() !== selectedCategory.value.toLowerCase()
      ) {
        return false
      }

      return true
    })

    // Sorting
    list = [...list].sort((a, b) => {
      if (filterStatus.value !== 'completed' && a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      switch (sortBy.value) {
        case 'priority-desc':
          return priorityWeight[b.priority] - priorityWeight[a.priority]
        case 'due-asc': {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        }
        case 'due-desc': {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return b.dueDate.localeCompare(a.dueDate)
        }
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'created-desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return list
  })

  const totalCompleted = computed(() => todos.value.filter((t) => t.completed).length)

  return {
    todos,
    categories,
    isLoaded,
    filterStatus,
    selectedCategory,
    searchQuery,
    sortBy,
    isDarkMode,
    filteredTodos,
    totalCompleted,
    todoToDelete,
    isDeleteModalOpen,
    toastMessage,
    toggleDarkMode,
    addCategory,
    addTodo,
    toggleTodo,
    updateTodo,
    promptDeleteTodo,
    cancelDelete,
    confirmDelete,
    clearCompleted,
    clearStorage,
  }
}
