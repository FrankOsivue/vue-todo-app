<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { Loader2, Plus, Search, Filter } from 'lucide-vue-next';
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from '../composables/useTodos';
import TodoItem from '../components/TodoItem.vue';
import TodoForm from '../components/TodoForm.vue';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../api/client';

// 1. Reactive State (Replaces useState)
const page = ref(1);
const search = ref('');
const statusFilter = ref('ALL');

const isModalOpen = ref(false);
const editingTodo = ref<Task | null>(null);

// 2. Vue Query Composables
const { data, isLoading, isError, error } = useTodos(page);
const createMutation = useCreateTodo();
const updateMutation = useUpdateTodo();
const deleteMutation = useDeleteTodo();

// Replaces the custom useTitle hook
watchEffect(() => {
  document.title = 'My Tasks | Todo App';
});

// 3. Computed Properties (Replaces useMemo)
const filteredTodos = computed(() => {
  // Vue Query with Axios returns the response in `data.value`.
  // Axios puts the payload in `.data`. Our API wraps tasks in `.data`.
  const tasksList = data.value?.data?.data;

  if (!tasksList) return [];

  return tasksList.filter((task: Task) => {
    const matchesSearch = task.name
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === 'ALL' ? true : task.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const paginationMeta = computed(() => data.value?.data?.meta);

// 4. Handlers
const handleEditClick = (task: Task): void => {
  editingTodo.value = task;
  isModalOpen.value = true;
};

const handleDeleteClick = async (id: string): Promise<void> => {
  if (window.confirm('Are you sure you want to delete this task?')) {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to delete task: ${errorMessage}`);
    }
  }
};

const handleSave = async (
  formData: CreateTaskInput | UpdateTaskInput,
): Promise<void> => {
  try {
    if (editingTodo.value) {
      await updateMutation.mutateAsync({
        id: editingTodo.value.id,
        data: formData as UpdateTaskInput,
      });
    } else {
      await createMutation.mutateAsync(formData as CreateTaskInput);
    }

    isModalOpen.value = false;
    editingTodo.value = null;
    search.value = '';
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || err.message || 'Unknown error';
    alert(`Failed to save task: ${errorMessage}`);
  }
};
</script>

<template>
  <div>
    <div
      v-if="isLoading"
      class="flex justify-center h-64 items-center"
    >
      <Loader2 class="animate-spin text-blue-500 w-8 h-8" />
    </div>

    <div
      v-else-if="isError"
      class="text-red-500 p-4"
    >
      Error: {{ (error as Error)?.message || 'An unexpected error occurred' }}
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 class="text-2xl font-bold text-gray-900">My Tasks</h1>
        <button
          @click="
            () => {
              editingTodo = null;
              isModalOpen = true;
            }
          "
          class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 w-full md:w-auto justify-center transition-colors"
        >
          <Plus class="w-4 h-4" /> Add Task
        </button>
      </div>

      <div
        class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4"
      >
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            v-model="search"
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div class="relative min-w-[150px]">
          <Filter
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <select
            v-model="statusFilter"
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
          >
            <option value="ALL">All Status</option>
            <option value="TODO">To Do</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      <div class="space-y-3">
        <p
          v-if="filteredTodos.length === 0"
          class="text-center text-gray-500 py-10"
        >
          No tasks found.
        </p>

        <TodoItem
          v-for="task in filteredTodos"
          :key="task.id"
          :task="task"
          @edit="handleEditClick"
          @delete="handleDeleteClick"
        />
      </div>

      <div
        class="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100"
      >
        <button
          @click="page = Math.max(1, page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <span class="font-medium text-gray-700">Page {{ page }}</span>
        <button
          @click="page++"
          :disabled="!paginationMeta?.hasNextPage"
          class="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <TodoForm
      v-if="isModalOpen"
      :initial-data="editingTodo || undefined"
      :is-loading="
        createMutation.isPending.value || updateMutation.isPending.value
      "
      @submit="handleSave"
      @cancel="
        () => {
          isModalOpen = false;
          editingTodo = null;
        }
      "
    />
  </div>
</template>
