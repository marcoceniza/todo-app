# Tests (Vitest)

The todo-app uses Vitest for unit tests, with Playwright e2e fully removed.

## Testing the `useTodos` composable

`useTodos` loads persisted data inside `onMounted`. Calling it outside a
component instance returns empty refs and warns ("onMounted is called when there
is no active component instance"). To test its full behavior:

- Wrap it in a small `defineComponent` that calls `useTodos()` in `setup()` and
  returns the composable result on the render context.
- `mount()` the wrapper from `@vue/test-utils` so lifecycle hooks run.
- Access the composable's return via `wrapper.vm.<key>`.

```ts
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
```

## localStorage mocking

`vi.stubGlobal('localStorage', mockStorage)` before each test. To assert
persistence, `mockStorage.setItem.mockClear()` after mount, then await a
macrotask before checking the mock — Vue's `watch` persists asynchronously
(`flush: 'pre'`, default), so `setItem` is not called synchronously after a
mutation.

The composable persists todos under the key `taskflow_todos_v2`.

## Conventions / gotchas

- `noUncheckedIndexedAccess` is on → `arr[i]` is `T | undefined`. Grab the item
  once into a const and use `!` / `?.` instead of repeated index access.
- Don't use `Array.prototype.at(0)` (needs es2022 lib target here); use `[0]!`.
- Mock-function type params required by oxlint rule
  `vitest(require-mock-type-parameters)`: write `vi.fn<(key: string) => string
| null>()` (implementation-signature form). The `<T, ArgsTuple>` form causes
  an oxc parser error.

## Composable change: empty-first load

`useTodos.ts` no longer defines/uses `INITIAL_TODOS`. On first run (no
persisted `taskflow_todos_v2`) the list loads as `[]` (the `catch` also sets `[]`).
So:

- Test "initializes empty when nothing is persisted" asserts `todos.value`
  `toEqual([])`, not `> 0`.
- Any test needing existing data must `addTodo(...)` first (toggle/filter/
  update/clear tests add a todo before exercising `find`/`toggleTodo`/etc.).
- When testing `clearCompleted`, add a second (non-completed) todo so a
  remaining item keeps `todos.value.length > 0` after clearing the completed one.
