import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
} from 'axios';

// 1. Core Task Interface
export interface Task {
  id: string;
  name: string;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  duration?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  status: 'TODO' | 'DONE' | string;
  archived: boolean;
  isDefault?: boolean | null;
  parentId?: string | null;
  children?: string | null;
  owner?: string | null;
  tags?: string[] | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// 2. Input Interfaces for Mutations
export interface CreateTaskInput {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  status?: string;
}

// 3. Pagination & Error Interfaces (Mapped directly from the API Documentation)
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// 4. Base Axios Configuration
export const api: AxiosInstance = axios.create({
  baseURL: 'https://api.oluwasetemi.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 5. Global Error Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// 6. API Methods
export const todoApi = {
  // GET /tasks
  getAll: (
    page = 1,
    limit = 10,
  ): Promise<AxiosResponse<PaginatedResponse<Task>>> =>
    api.get<PaginatedResponse<Task>>(`/tasks?page=${page}&limit=${limit}`),

  // GET /tasks/{id}
  getOne: (id: string): Promise<AxiosResponse<Task>> =>
    api.get<Task>(`/tasks/${id}`),

  // POST /tasks
  create: (data: CreateTaskInput): Promise<AxiosResponse<Task>> =>
    api.post<Task>('/tasks', data),

  // PATCH /tasks/{id}
  update: (id: string, data: UpdateTaskInput): Promise<AxiosResponse<Task>> =>
    api.patch<Task>(`/tasks/${id}`, data),

  // DELETE /tasks/{id}
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/tasks/${id}`),
};
