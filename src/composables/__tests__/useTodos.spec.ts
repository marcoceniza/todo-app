import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useTodos } from '../useTodos'

const mockStorage = {
  getItem: vi.fn<(key: string) => string | null>(),
  setItem: vi.fn<(key: string, value: string) => void>(),
  removeItem: vi.fn<(key: string) => void>(),
}

// Wrapper so the composable's `onMounted` (data loading) actually runs.
const useTodosWrapper = defineComponent({
  setup() {
    return { todos: useTodos() }
  },
  render() {
    return h('div')
  },
})

function useTodosMounted() {
  const wrapper = mount(useTodosWrapper)
  return wrapper.vm.todos as ReturnType<typeof useTodos>
}

beforeEach(() => {
  mockStorage.getItem.mockReturnValue(null)
  vi.stubGlobal('localStorage', mockStorage)
})

describe('useTodos', () => {
  it('initializes empty when nothing is persisted', () => {
    const { todos, isLoaded } = useTodosMounted()
    expect(isLoaded.value).toBe(true)
    expect(todos.value).toEqual([])
  })

  it('adds a new todo with required fields', () => {
    const { todos, addTodo } = useTodosMounted()
    const before = todos.value.length

    addTodo({
      title: 'Buy milk',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })

    expect(todos.value.length).toBe(before + 1)
    const added = todos.value[0]
    expect(added).toMatchObject({
      title: 'Buy milk',
      priority: 'medium',
      completed: false,
      category: 'home',
    })
    expect(added?.description).toBeFalsy()
    expect(added?.id).toBeTruthy()
  })

  it('does not add a todo when the title is empty', () => {
    const { todos, addTodo } = useTodosMounted()
    const before = todos.value.length

    addTodo({
      title: '   ',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })

    expect(todos.value.length).toBe(before)
  })

  it('toggles a todo and flips completedAt', () => {
    const { todos, addTodo, toggleTodo } = useTodosMounted()
    addTodo({
      title: 'Toggle me',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })
    const first = todos.value[0]

    expect(first?.completed).toBe(false)

    toggleTodo(first!.id)
    expect(first?.completed).toBe(true)
    expect(first?.completedAt).toBeTruthy()

    toggleTodo(first!.id)
    expect(first?.completed).toBe(false)
    expect(first?.completedAt).toBeFalsy()
  })

  it('updates an existing todo, preserving its id', () => {
    const { todos, addTodo, updateTodo } = useTodosMounted()
    addTodo({
      title: 'Rename me',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })
    const first = todos.value[0]
    const originalId = first!.id

    updateTodo(originalId, { title: 'Renamed task', priority: 'urgent' })

    const updated = todos.value.find((t) => t.id === originalId)
    expect(updated).toBeDefined()
    expect(updated?.title).toBe('Renamed task')
    expect(updated?.priority).toBe('urgent')
  })

  it('counts and clears completed todos', () => {
    const { todos, addTodo, totalCompleted, clearCompleted, toggleTodo } = useTodosMounted()
    addTodo({
      title: 'Complete me',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })
    addTodo({
      title: 'Keep me',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })
    const first = todos.value[0]

    toggleTodo(first!.id)
    expect(totalCompleted.value).toBeGreaterThan(0)

    clearCompleted()

    expect(totalCompleted.value).toBe(0)
    expect(todos.value.every((t) => !t.completed)).toBe(true)
    expect(todos.value.length).toBeGreaterThan(0)
  })

  it('filters completed todos by status', () => {
    const { todos, addTodo, toggleTodo, filterStatus, filteredTodos } = useTodosMounted()
    addTodo({
      title: 'Filter me',
      description: '',
      priority: 'medium',
      category: 'home',
      dueDate: undefined,
    })
    const first = todos.value[0]

    toggleTodo(first!.id)

    filterStatus.value = 'completed'
    expect(filteredTodos.value.length).toBeGreaterThan(0)
    expect(filteredTodos.value.every((t) => t.completed)).toBe(true)

    filterStatus.value = 'active'
    expect(filteredTodos.value.every((t) => !t.completed)).toBe(true)
  })

  it('persists todos to localStorage after mutations', async () => {
    const { addTodo } = useTodosMounted()
    // Track only post-mount mutations.
    mockStorage.setItem.mockClear()

    addTodo({
      title: 'Persist me',
      description: '',
      priority: 'low',
      category: 'home',
      dueDate: undefined,
    })

    // The watch persists on the next flush tick, so await a macrotask
    // before asserting the localStorage side-effect.
    await new Promise((resolve) => setTimeout(resolve, 0))

    const stored = mockStorage.setItem
    expect(stored).toHaveBeenCalled()
    const todosCall = stored.mock.calls.find((c) => c[0] === 'taskflow_todos_v2')
    expect(todosCall).toBeDefined()
    const storedTodos = JSON.parse(todosCall![1] as string)
    expect(storedTodos.some((t: { title: string }) => t.title === 'Persist me')).toBe(true)
  })
})
