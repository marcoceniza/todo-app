<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Priority } from '../types/todo'
import { PRIORITIES } from '../utils/todoHelpers'
import type { CategoryOption } from '../composables/useTodos'
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  Flag,
  AlignLeft,
  Sparkles,
  Check,
  X,
} from 'lucide-vue-next'

const props = defineProps<{
  categories: CategoryOption[]
}>()

const emit = defineEmits<{
  (
    e: 'add',
    data: {
      title: string
      description?: string
      priority: Priority
      category: string
      dueDate?: string
    },
  ): void
  (e: 'create-category', name: string): string | null
}>()

const title = ref('')
const description = ref('')
const priority = ref<Priority>('medium')
const category = ref('work')
const dueDate = ref('')
const isExpanded = ref(false)

// Custom category inline creation
const isAddingCustomCategory = ref(false)
const newCategoryName = ref('')

const todayStr = computed(() => new Date().toISOString().split('T')[0])

const handleCategoryChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  if (target.value === '__custom__') {
    isAddingCustomCategory.value = true
    category.value = props.categories[0]?.key || 'work'
  } else {
    category.value = target.value
  }
}

const handleCreateCategory = () => {
  if (!newCategoryName.value.trim()) return
  const createdKey = emit('create-category', newCategoryName.value.trim())
  if (createdKey) {
    category.value = createdKey
  }
  newCategoryName.value = ''
  isAddingCustomCategory.value = false
}

const handleSubmit = () => {
  if (!title.value.trim()) return

  emit('add', {
    title: title.value,
    description: description.value,
    priority: priority.value,
    category: category.value,
    dueDate: dueDate.value || undefined,
  })

  // Reset fields
  title.value = ''
  description.value = ''
  dueDate.value = ''
}

const setQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
  const d = new Date()
  if (type === 'today') {
    dueDate.value = d.toISOString().split('T')[0]!
  } else if (type === 'tomorrow') {
    d.setDate(d.getDate() + 1)
    dueDate.value = d.toISOString().split('T')[0]!
  } else if (type === 'nextWeek') {
    d.setDate(d.getDate() + 7)
    dueDate.value = d.toISOString().split('T')[0]!
  }
}
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all p-3 sm:p-4 mb-6"
  >
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <!-- Main input bar -->
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="flex-1 relative flex items-center">
          <input
            v-model="title"
            type="text"
            placeholder="Add a new task... (press Enter to save)"
            class="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm sm:text-base border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            @keydown.enter.prevent="handleSubmit"
          />
        </div>

        <button
          type="button"
          @click="isExpanded = !isExpanded"
          class="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          :title="isExpanded ? 'Hide details' : 'More options'"
        >
          <span class="hidden sm:inline">{{ isExpanded ? 'Simple' : 'Details' }}</span>
          <ChevronUp v-if="isExpanded" class="w-4 h-4 text-slate-500" />
          <ChevronDown v-else class="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="submit"
          :disabled="!title.trim()"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span class="hidden sm:inline">Add Task</span>
        </button>
      </div>

      <!-- Expanded options -->
      <div
        v-if="isExpanded"
        class="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 animate-fadeIn"
      >
        <!-- Optional Description -->
        <div>
          <label
            class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5"
          >
            <AlignLeft class="w-3.5 h-3.5" /> Description & Notes (optional)
          </label>
          <textarea
            v-model="description"
            rows="2"
            placeholder="Add relevant notes, links, or context..."
            class="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Priority Selector -->
          <div>
            <label
              class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5"
            >
              <Flag class="w-3.5 h-3.5" /> Priority
            </label>
            <div class="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                v-for="p in PRIORITIES"
                :key="p.key"
                type="button"
                @click="priority = p.key"
                class="py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer"
                :class="
                  priority === p.key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                "
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Category Selector with Custom Category Button -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label
                class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"
              >
                <Tag class="w-3.5 h-3.5" /> Category
              </label>
              <button
                v-if="!isAddingCustomCategory"
                type="button"
                @click="isAddingCustomCategory = true"
                class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus class="w-3 h-3" /> New
              </button>
            </div>

            <!-- Custom Category Input Inline -->
            <div v-if="isAddingCustomCategory" class="flex items-center gap-1.5">
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="Category name..."
                class="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-2.5 py-1.5 text-xs border border-indigo-400 dark:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                @keydown.enter.prevent="handleCreateCategory"
                @keydown.esc="isAddingCustomCategory = false"
                autoFocus
              />
              <button
                type="button"
                @click="handleCreateCategory"
                :disabled="!newCategoryName.trim()"
                class="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 cursor-pointer"
                title="Save Category"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="isAddingCustomCategory = false"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Cancel"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Normal Category Select Dropdown -->
            <select
              v-else
              :value="category"
              @change="handleCategoryChange"
              class="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer capitalize"
            >
              <option v-for="cat in categories" :key="cat.key" :value="cat.key">
                {{ cat.label }}
              </option>
              <option value="__custom__">+ Add Custom Category...</option>
            </select>
          </div>

          <!-- Due Date Selector -->
          <div>
            <label
              class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5"
            >
              <Calendar class="w-3.5 h-3.5" /> Due Date
            </label>
            <div class="flex items-center gap-1.5">
              <input
                v-model="dueDate"
                type="date"
                :min="todayStr"
                class="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Quick date shortcuts -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1"
            ><Sparkles class="w-3 h-3 text-indigo-500" /> Quick dates:</span
          >
          <button
            type="button"
            @click="setQuickDate('today')"
            class="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
          >
            Today
          </button>
          <span>•</span>
          <button
            type="button"
            @click="setQuickDate('tomorrow')"
            class="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
          >
            Tomorrow
          </button>
          <span>•</span>
          <button
            type="button"
            @click="setQuickDate('nextWeek')"
            class="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
          >
            Next Week
          </button>
          <button
            v-if="dueDate"
            type="button"
            @click="dueDate = ''"
            class="ml-auto text-xs text-rose-500 hover:underline cursor-pointer"
          >
            Clear date
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
