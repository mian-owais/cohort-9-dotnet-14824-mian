import api from './api';

export interface DashboardMetrics {
  completedTaskCount: number;
  inProgressTaskCount: number;
  pendingTaskCount: number;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>('/dashboard/metrics');
    return response.data;
  },
};
