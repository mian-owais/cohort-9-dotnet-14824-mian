import api from './api';

export interface TaskDto {
  id: number;
  title: string;
  description: string;
  status: number; // 0 = Pending, 1 = InProgress, 2 = Completed
  priority: number; // 0 = Low, 1 = Medium, 2 = High
  createdAt: string;
  dueDate: string | null;
  userId: number;
  projectId: number | null;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: number;
  dueDate: string | null;
  assignedToUserId?: number;
  projectId?: number | null;
}

export interface UpdateTaskDto {
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate: string | null;
  assignedToUserId?: number;
  projectId?: number | null;
}

export const taskService = {
  getTasks: async (): Promise<TaskDto[]> => {
    const response = await api.get<TaskDto[]>('/task');
    return response.data;
  },

  getTaskById: async (id: number): Promise<TaskDto> => {
    const response = await api.get<TaskDto>(`/task/${id}`);
    return response.data;
  },

  createTask: async (dto: CreateTaskDto): Promise<TaskDto> => {
    const response = await api.post<TaskDto>('/task', dto);
    return response.data;
  },

  updateTask: async (id: number, dto: UpdateTaskDto): Promise<TaskDto> => {
    const response = await api.put<TaskDto>(`/task/${id}`, dto);
    return response.data;
  },

  askChat: async (taskId: number | null, message: string): Promise<string> => {
    const response = await api.post<{ response: string }>('/chat/ask', { taskId, message });
    return response.data.response;
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/task/${id}`);
  }
};
