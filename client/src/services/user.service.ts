import api from './api';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export const userService = {
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get('/user/me');
    return response.data;
  },
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/user');
    return response.data;
  }
};
