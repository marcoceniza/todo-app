<script setup lang="ts">
import { ref } from 'vue'
import type { FilterStatus, SortOption } from '../types/todo'
import type { CategoryOption } from '../composables/useTodos'
import { Search, X, ArrowUpDown, Tag, CheckCircle2, Plus, Check } from 'lucide-vue-next'

defineProps<{
  filterStatus: FilterStatus
  selectedCategory: string
  searchQuery: string
  sortBy: SortOption
  totalCompleted: number
  totalCount: number
  categories: CategoryOption[]
}>()

const emit = defineEmits<{
  (e: 'update:filterStatus', status: FilterStatus): void
  (e: 'update:selectedCategory', category: string): void
  (e: 'update:searchQuery', query: string): void
  (e: 'update:sortBy', sort: SortOption): void
  (e: 'clear-completed'): void
  (e: 'create-category', name: string): string | null
}>()

const isAddingCategory = ref(false)
const newCategoryText = ref('')

const handleCategorySelectChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__custom__') {
    isAddingCategory.value = true
  } else {
    emit('update:selectedCategory', val)
  }
}

const handleSaveCategory = () => {
  if (!newCategoryText.value.trim()) return
  const key = emit('create-category', newCategoryText.value.trim())
  if (key) {
    emit('update:selectedCategory', key)
  }
  newCategoryText.value = ''
  isAddingCategory.value = false
}
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-xs space-y-3"
  >
    <!-- Top row: Search input -->
    <div class="relative">
      <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Search tasks by title or notes..."
        class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
      />
      <button
        v-if="searchQuery"
        type="button"
        @click="emit('update:searchQuery', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
        title="Clear search"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Bottom row: Select Dropdowns for Status, Category, and Sort + Clear Done -->
    <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-2.5 pt-1">
      <!-- Category Select Input with quick custom creation -->
      <div class="relative">
        <div class="flex items-center justify-between mb-1">
          <label
            class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"
          >
            <Tag class="w-3 h-3 text-indigo-500" /> Category
          </label>
          <button
            v-if="!isAddingCategory"
            type="button"
            @click="isAddingCategory = true"
            class="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            title="Create new category"
          >
            <Plus class="w-2.5 h-2.5" /> New
          </button>
        </div>

        <!-- Inline input if user clicked new category -->
        <div v-if="isAddingCategory" class="flex items-center gap-1">
          <input
            v-model="newCategoryText"
            type="text"
            placeholder="Category name..."
            class="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-indigo-400 dark:border-indigo-600 text-slate-800 dark:text-slate-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            @keydown.enter.prevent="handleSaveCategory"
            @keydown.esc="isAddingCategory = false"
            autoFocus
          />
          <button
            type="button"
            @click="handleSaveCategory"
            :disabled="!newCategoryText.trim()"
            class="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 cursor-pointer"
            title="Save"
          >
            <Check class="w-3 h-3" />
          </button>
          <button
            type="button"
            @click="isAddingCategory = false"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title="Cancel"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Normal Category Select Dropdown -->
        <select
          v-else
          :value="selectedCategory"
          @change="handleCategorySelectChange"
          class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors cursor-pointer capitalize"
        >
          <option value="all">All Categories</option>
          <option v-for="cat in categories" :key="cat.key" :value="cat.key">
            {{ cat.label }}
          </option>
          <option value="__custom__">+ Add Custom Category...</option>
        </select>
      </div>

      <!-- Sort By Select Input -->
      <div class="relative">
        <label
          class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"
        >
          <ArrowUpDown class="w-3 h-3 text-indigo-500" /> Sort By
        </label>
        <select
          :value="sortBy"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as SortOption)"
          class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors cursor-pointer"
        >
          <option value="created-desc">Newest First</option>
          <option value="created-asc">Oldest First</option>
          <option value="due-asc">Due Date (Earliest)</option>
          <option value="due-desc">Due Date (Latest)</option>
          <option value="priority-desc">Highest Priority</option>
          <option value="title-asc">Alphabetical (A-Z)</option>
        </select>
      </div>

      <!-- Clear Completed Button -->
      <div class="flex items-end">
        <button
          v-if="totalCompleted > 0"
          type="button"
          @click="emit('clear-completed')"
          class="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Clear Done ({{ totalCompleted }})</span>
        </button>
        <div
          v-else
          class="hidden md:block w-full py-2 px-3 text-xs text-slate-400 dark:text-slate-500 text-center font-medium"
        >
          {{ totalCount }} {{ totalCount === 1 ? 'task' : 'tasks' }}
        </div>
      </div>
    </div>
  </div>
</template>
