<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodos } from './composables/useTodos'
import TodoInput from './components/TodoInput.vue'
import TodoItem from './components/TodoItem.vue'
import TodoFilters from './components/TodoFilters.vue'
import TodoEditModal from './components/TodoEditModal.vue'
import ConfirmDeleteModal from './components/ConfirmDeleteModal.vue'
import type { Todo } from './types/todo'
import { CheckCircle, Sun, Moon, ListChecks, Inbox, Sparkles, RotateCcw } from 'lucide-vue-next'

const {
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
} = useTodos()

// Edit Modal State
const editingTodo = ref<Todo | null>(null)
const isEditModalOpen = ref(false)

const openEditModal = (todo: Todo) => {
  editingTodo.value = todo
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  editingTodo.value = null
  isEditModalOpen.value = false
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  selectedCategory.value = 'all'
}

const formattedCurrentDate = computed(() => {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date())
})
</script>

<template>
  <div class="min-h-screen pb-16 transition-colors duration-200">
    <!-- Header / Navbar -->
    <header
      class="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800"
    >
      <div class="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Logo and App Title -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25"
          >
            <CheckCircle class="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1
                class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none"
              >
                TODO
              </h1>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ formattedCurrentDate }}
            </p>
          </div>
        </div>

        <!-- Controls: Theme Toggle & Clear Data -->
        <div class="flex items-center gap-2">
          <!-- Dark mode toggle -->
          <button
            type="button"
            @click="toggleDarkMode"
            class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDarkMode" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-slate-600" />
          </button>

          <!-- Clear all data -->
          <button
            type="button"
            @click="clearStorage"
            class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            title="Clear all data"
          >
            <RotateCcw class="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <!-- Loading State -->
      <div v-if="!isLoaded" class="py-20 text-center text-slate-400">
        <div
          class="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"
        ></div>
        <p class="text-sm">Loading your tasks...</p>
      </div>

      <div v-else>
        <!-- New Todo Input -->
        <TodoInput :categories="categories" @add="addTodo" @create-category="addCategory" />

        <!-- Filters (Category select, Search, Sort) -->
        <TodoFilters
          v-model:filterStatus="filterStatus"
          v-model:selectedCategory="selectedCategory"
          v-model:searchQuery="searchQuery"
          v-model:sortBy="sortBy"
          :totalCompleted="totalCompleted"
          :totalCount="todos.length"
          :categories="categories"
          @clear-completed="clearCompleted"
          @create-category="addCategory"
        />

        <!-- Task List Header Count with Clickable Status Options on Right -->
        <div class="flex items-center justify-between gap-3 text-xs px-1 mb-3.5 flex-wrap">
          <div class="flex items-center gap-2">
            <div
              class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              <ListChecks class="w-4 h-4 text-indigo-500" />
              <span>Tasks</span>
              <span class="text-slate-700 dark:text-slate-200 font-bold"
                >({{ filteredTodos.length }})</span
              >
            </div>

            <span
              v-if="searchQuery"
              class="text-indigo-600 dark:text-indigo-400 lowercase text-[11px] font-normal"
            >
              • matching "{{ searchQuery }}"
            </span>
          </div>

          <!-- Clickable 3 Status Options on the right side -->
          <div
            class="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
          >
            <button
              type="button"
              @click="filterStatus = 'all'"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              :class="[
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              <span>All</span>
              <span class="text-[10px] opacity-75 font-normal">({{ todos.length }})</span>
            </button>

            <button
              type="button"
              @click="filterStatus = 'active'"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              :class="[
                filterStatus === 'active'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              <span>Active</span>
              <span class="text-[10px] opacity-75 font-normal"
                >({{ todos.length - totalCompleted }})</span
              >
            </button>

            <button
              type="button"
              @click="filterStatus = 'completed'"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              :class="[
                filterStatus === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
            >
              <span>Done</span>
              <span class="text-[10px] opacity-75 font-normal">({{ totalCompleted }})</span>
            </button>
          </div>
        </div>

        <!-- Todos List -->
        <div v-if="filteredTodos.length > 0" class="space-y-2.5">
          <TodoItem
            v-for="todo in filteredTodos"
            :key="todo.id"
            :todo="todo"
            @toggle="toggleTodo"
            @delete="promptDeleteTodo"
            @edit="openEditModal"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center my-6 shadow-xs"
        >
          <div
            class="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Inbox
              v-if="searchQuery || filterStatus !== 'all' || selectedCategory !== 'all'"
              class="w-7 h-7"
            />
            <Sparkles v-else class="w-7 h-7" />
          </div>

          <h3 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            <span v-if="searchQuery">No tasks matching "{{ searchQuery }}"</span>
            <span v-else-if="filterStatus === 'completed'">No completed tasks yet</span>
            <span v-else-if="filterStatus === 'active'">All caught up! No active tasks</span>
            <span v-else>No tasks on your list</span>
          </h3>

          <p
            class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5"
          >
            <span v-if="searchQuery"
              >Try adjusting your keywords or clearing the category filter.</span
            >
            <span v-else-if="filterStatus === 'completed'"
              >Complete items by checking the box next to any task.</span
            >
            <span v-else-if="filterStatus === 'active'"
              >Great job! You have finished all active tasks.</span
            >
            <span v-else>Add your first task using the input form above to get started.</span>
          </p>

          <button
            v-if="searchQuery || filterStatus !== 'all' || selectedCategory !== 'all'"
            type="button"
            @click="resetFilters"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </main>

    <!-- Edit Task Modal -->
    <TodoEditModal
      :isOpen="isEditModalOpen"
      :todo="editingTodo"
      :categories="categories"
      @close="closeEditModal"
      @save="updateTodo"
      @create-category="addCategory"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal
      :isOpen="isDeleteModalOpen"
      :todo="todoToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Toast Notification -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-300 text-xs sm:text-sm font-medium"
      >
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>
