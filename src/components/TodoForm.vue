<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Save, Loader2 } from 'lucide-vue-next';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../api/client';

const props = defineProps<{
  initialData?: Partial<Task>;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: CreateTaskInput | UpdateTaskInput): void;
  (e: 'cancel'): void;
}>();

const isEditing = computed(() => Boolean(props.initialData?.id));

// 1. Updated 'title' to 'name' to match the new Task interface
const name = ref(props.initialData?.name || '');
const description = ref(props.initialData?.description || '');

watch(
  () => props.initialData,
  (newData) => {
    if (isEditing.value && newData) {
      name.value = newData.name || '';
      description.value = newData.description || '';
    }
  },
  { deep: true },
);

const handleSubmit = (): void => {
  const payload: CreateTaskInput | UpdateTaskInput = {
    name: name.value,
    description: description.value,
  };

  // 2. Set default status for new tasks, exactly like your React code did
  if (!isEditing.value) {
    payload.status = 'TODO';
  }

  emit('submit', payload);
};
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
      <div
        class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"
      >
        <h2 class="text-lg font-bold text-gray-900">
          {{ isEditing ? 'Edit Task' : 'New Task' }}
        </h2>
        <button
          @click="emit('cancel')"
          type="button"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="p-6 space-y-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Task Name</label
          >
          <input
            type="text"
            required
            v-model="name"
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow"
            placeholder="e.g., Buy Groceries"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Description</label
          >
          <textarea
            rows="3"
            v-model="description"
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-shadow"
          ></textarea>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button
            type="button"
            @click="emit('cancel')"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Loader2
              v-if="isLoading"
              class="w-4 h-4 animate-spin"
            />
            <Save
              v-else
              class="w-4 h-4"
            />
            Save Task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
