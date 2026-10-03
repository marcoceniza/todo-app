<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Todo, Priority } from '../types/todo';
import { PRIORITIES } from '../utils/todoHelpers';
import type { CategoryOption } from '../composables/useTodos';
import { X, Calendar, Flag, Tag, AlignLeft, Plus, Check } from 'lucide-vue-next';

const props = defineProps<{
  todo: Todo | null;
  isOpen: boolean;
  categories: CategoryOption[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', id: string, updates: Partial<Todo>): void;
  (e: 'create-category', name: string): string | null;
}>();

const title = ref('');
const description = ref('');
const priority = ref<Priority>('medium');
const category = ref('work');
const dueDate = ref('');

const isAddingCategory = ref(false);
const newCategoryText = ref('');

watch(
  () => props.todo,
  (newVal) => {
    if (newVal) {
      title.value = newVal.title;
      description.value = newVal.description || '';
      priority.value = newVal.priority;
      category.value = newVal.category;
      dueDate.value = newVal.dueDate || '';
      isAddingCategory.value = false;
      newCategoryText.value = '';
    }
  },
  { immediate: true }
);

const handleCategoryChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value;
  if (val === '__custom__') {
    isAddingCategory.value = true;
  } else {
    category.value = val;
  }
};

const handleSaveCategory = () => {
  if (!newCategoryText.value.trim()) return;
  const key = emit('create-category', newCategoryText.value.trim());
  if (key) {
    category.value = key;
  }
  newCategoryText.value = '';
  isAddingCategory.value = false;
};

const handleSave = () => {
  if (!props.todo || !title.value.trim()) return;

  emit('save', props.todo.id, {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    priority: priority.value,
    category: category.value,
    dueDate: dueDate.value || undefined,
  });

  emit('close');
};
</script>

<template>
  <div
    v-if="isOpen && todo"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Edit Task
        </h3>
        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Title Input -->
      <div>
        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
          Task Title
        </label>
        <input
          v-model="title"
          type="text"
          class="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Task title..."
        />
      </div>

      <!-- Description Input -->
      <div>
        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5">
          <AlignLeft class="w-3.5 h-3.5" /> Description & Notes
        </label>
        <textarea
          v-model="description"
          rows="3"
          class="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Add extra details..."
        ></textarea>
      </div>

      <!-- Priority & Category & Due Date Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <!-- Priority -->
        <div>
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5">
            <Flag class="w-3.5 h-3.5" /> Priority
          </label>
          <select
            v-model="priority"
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize cursor-pointer"
          >
            <option v-for="p in PRIORITIES" :key="p.key" :value="p.key">
              {{ p.label }}
            </option>
          </select>
        </div>

        <!-- Category -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Tag class="w-3.5 h-3.5" /> Category
            </label>
            <button
              v-if="!isAddingCategory"
              type="button"
              @click="isAddingCategory = true"
              class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Plus class="w-3 h-3" /> New
            </button>
          </div>

          <div v-if="isAddingCategory" class="flex items-center gap-1">
            <input
              v-model="newCategoryText"
              type="text"
              placeholder="Category name..."
              class="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-2.5 py-1.5 text-xs border border-indigo-400 dark:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              <Check class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="isAddingCategory = false"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Cancel"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            v-else
            :value="category"
            @change="handleCategoryChange"
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize cursor-pointer"
          >
            <option v-for="cat in categories" :key="cat.key" :value="cat.key">
              {{ cat.label }}
            </option>
            <option value="__custom__">+ Add Custom Category...</option>
          </select>
        </div>

        <!-- Due Date -->
        <div class="sm:col-span-2">
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1.5">
            <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5" /> Due Date</span>
            <button
              v-if="dueDate"
              type="button"
              @click="dueDate = ''"
              class="text-xs text-rose-500 hover:underline cursor-pointer"
            >
              Clear date
            </button>
          </label>
          <input
            v-model="dueDate"
            type="date"
            class="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="!title.trim()"
          class="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>
