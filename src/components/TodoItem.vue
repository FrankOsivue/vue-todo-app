<script setup lang="ts">
import { RouterLink } from 'vue-router';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Clock,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-vue-next';
import { useUpdateTodo } from '../composables/useTodos';
import type { Task } from '../api/client';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'edit', task: Task): void;
  (e: 'delete', id: string): void;
}>();

// Destructure the hook to make the template cleaner and fix the Ref error
const { mutate: updateTask, isPending: isUpdating } = useUpdateTodo();

/**
 * Toggles the completion status between 'TODO' and 'DONE'.
 * Silently aborts if an update is currently in progress.
 */
const handleToggle = (): void => {
  if (isUpdating.value) return;

  const newStatus = props.task.status === 'DONE' ? 'TODO' : 'DONE';

  updateTask(
    {
      id: props.task.id,
      data: {
        status: newStatus,
      },
    },
    {
      onError: (error: any) => {
        const serverMessage =
          error.response?.data?.message || 'Unknown error occurred';
        console.error('Task update failed:', serverMessage);
        alert(`Failed to update task: ${serverMessage}`);
      },
    },
  );
};
</script>

<template>
  <div
    class="bg-white p-4 rounded-lg shadow-sm border transition-all flex items-center justify-between group"
    :class="isUpdating ? 'opacity-50' : 'hover:shadow-md border-gray-100'"
  >
    <div class="flex items-center gap-3 flex-1 overflow-hidden">
      <button
        @click="handleToggle"
        :disabled="isUpdating"
        class="focus:outline-none rounded-full shrink-0"
        aria-label="Toggle task completion"
      >
        <Loader2
          v-if="isUpdating"
          class="w-6 h-6 text-blue-500 animate-spin"
        />
        <CheckCircle
          v-else-if="task.status === 'DONE'"
          class="w-6 h-6 text-green-500"
        />
        <Circle
          v-else
          class="w-6 h-6 text-gray-300 hover:text-blue-500"
        />
      </button>

      <div class="flex flex-col min-w-0">
        <span
          class="font-medium truncate"
          :class="
            task.status === 'DONE'
              ? 'line-through text-gray-400'
              : 'text-gray-900'
          "
        >
          {{ task.name }}
        </span>
        <span
          class="text-xs uppercase mt-1 flex items-center gap-1 font-semibold text-gray-500"
        >
          <Clock class="w-3 h-3" />
          {{ task.status }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-1 ml-2">
      <button
        @click="emit('edit', task)"
        class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="Edit Task"
      >
        <Pencil class="w-4 h-4" />
      </button>

      <button
        @click="emit('delete', task.id)"
        class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="Delete Task"
      >
        <Trash2 class="w-4 h-4" />
      </button>

      <RouterLink
        :to="`/todos/${task.id}`"
        class="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="View Details"
      >
        <ArrowRight class="w-5 h-5" />
      </RouterLink>
    </div>
  </div>
</template>
