<script setup lang="ts">
import type { Todo } from '../types/todo'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  todo: Todo | null
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div
    v-if="isOpen && todo"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    @click.self="emit('cancel')"
    @keydown.esc="emit('cancel')"
  >
    <div
      class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-start gap-3.5">
        <div
          class="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0"
        >
          <AlertTriangle class="w-5 h-5 stroke-[2.2]" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Delete this task?
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Are you sure you want to remove
            <span class="font-semibold text-slate-700 dark:text-slate-200">"{{ todo.title }}"</span
            >? This action cannot be undone.
          </p>
        </div>
      </div>

      <div
        class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800"
      >
        <button
          type="button"
          @click="emit('cancel')"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="emit('confirm')"
          class="px-4.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Trash2 class="w-4 h-4" />
          <span>Delete Task</span>
        </button>
      </div>
    </div>
  </div>
</template>
