<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '../types/todo'
import { PRIORITIES, formatDueDate, getCategoryMeta } from '../utils/todoHelpers'
import {
  Check,
  Calendar,
  Trash2,
  Edit3,
  AlertCircle,
  Briefcase,
  User,
  BookOpen,
  ShoppingCart,
  HeartPulse,
  Bookmark,
  Tag,
} from 'lucide-vue-next'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', todo: Todo): void
  (e: 'edit', todo: Todo): void
}>()

const categoryMeta = computed(() => {
  return getCategoryMeta(props.todo.category)
})

const priorityMeta = computed(() => {
  return PRIORITIES.find((p) => p.key === props.todo.priority) || PRIORITIES[2]!
})

const dueInfo = computed(() => {
  return formatDueDate(props.todo.dueDate)
})
</script>

<template>
  <div
    class="group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-md"
    :class="[
      todo.completed
        ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
    ]"
  >
    <div class="flex items-start gap-3 sm:gap-3.5">
      <!-- Checkbox button -->
      <button
        type="button"
        @click="emit('toggle', todo.id)"
        class="mt-0.5 relative flex-shrink-0 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg border flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
        :class="[
          todo.completed
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800',
        ]"
        :aria-label="todo.completed ? 'Mark task incomplete' : 'Mark task complete'"
      >
        <Check v-if="todo.completed" class="w-3.5 h-3.5 stroke-[3]" />
      </button>

      <!-- Main Content Area -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <!-- Title & Description -->
          <div class="space-y-1">
            <h3
              class="text-sm sm:text-base font-semibold leading-snug break-words transition-all"
              :class="[
                todo.completed
                  ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                  : 'text-slate-800 dark:text-slate-100',
              ]"
            >
              {{ todo.title }}
            </h3>

            <p
              v-if="todo.description"
              class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line break-words"
              :class="{ 'line-through opacity-70': todo.completed }"
            >
              {{ todo.description }}
            </p>
          </div>

          <!-- Actions: Edit & Delete -->
          <div
            class="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <button
              type="button"
              @click="emit('edit', todo)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Edit task"
            >
              <Edit3 class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="emit('delete', todo)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Meta badges: Priority, Category, Due date -->
        <div class="flex flex-wrap items-center gap-2 mt-3 pt-2 text-xs">
          <!-- Priority Pill -->
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium border text-[11px]"
            :class="priorityMeta.badgeClass"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="priorityMeta.dotColor"></span>
            {{ priorityMeta.label }}
          </span>

          <!-- Category Pill -->
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border text-[11px]"
            :class="categoryMeta.badgeClass"
          >
            <Briefcase v-if="categoryMeta.iconName === 'Briefcase'" class="w-3 h-3" />
            <User v-else-if="categoryMeta.iconName === 'User'" class="w-3 h-3" />
            <BookOpen v-else-if="categoryMeta.iconName === 'BookOpen'" class="w-3 h-3" />
            <ShoppingCart v-else-if="categoryMeta.iconName === 'ShoppingCart'" class="w-3 h-3" />
            <HeartPulse v-else-if="categoryMeta.iconName === 'HeartPulse'" class="w-3 h-3" />
            <Bookmark v-else-if="categoryMeta.iconName === 'Bookmark'" class="w-3 h-3" />
            <Tag v-else class="w-3 h-3" />
            {{ categoryMeta.label }}
          </span>

          <!-- Due Date Badge -->
          <span
            v-if="todo.dueDate"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            :class="dueInfo.colorClass"
          >
            <AlertCircle v-if="dueInfo.status === 'overdue'" class="w-3 h-3 text-red-500" />
            <Calendar v-else class="w-3 h-3" />
            {{ dueInfo.text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
