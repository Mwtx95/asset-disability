import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export interface UserRole {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: number | null;
  role_name?: string;
  branch: number | null;
  branch_name?: string;
  is_active: boolean;
  last_login?: string;
  last_activity: string;
  profile_image?: string;
  date_joined: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: number;
  action: string;
  action_time: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: number;
  branch?: number;
  is_active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: number;
  branch?: number;
  is_active?: boolean;
}

// Get all users
export const usersQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: async (): Promise<User[]> => {
    const response = await axios.get('/users/users/');
    return response.data.results || response.data;
  },
});

// Get user roles
export const userRolesQueryOptions = queryOptions({
  queryKey: ['user-roles'],
  queryFn: async (): Promise<UserRole[]> => {
    const response = await axios.get('/users/roles/');
    return response.data.results || response.data;
  },
});

// Get current user
export const currentUserQueryOptions = queryOptions({
  queryKey: ['current-user'],
  queryFn: async (): Promise<User> => {
    const response = await axios.get('/users/users/me/');
    return response.data;
  },
});

// Get user activities
export const userActivitiesQueryOptions = (userId: number) => queryOptions({
  queryKey: ['user-activities', userId],
  queryFn: async (): Promise<UserActivity[]> => {
    const response = await axios.get(`/users/users/${userId}/activities/`);
    return response.data.results || response.data;
  },
});

// Create user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await axios.post('/users/users/', userData);
  return response.data;
};

// Update user
export const updateUser = async (userId: number, userData: UpdateUserData): Promise<User> => {
  const response = await axios.patch(`/users/users/${userId}/`, userData);
  return response.data;
};

// Deactivate user
export const deactivateUser = async (userId: number): Promise<void> => {
  await axios.post(`/users/users/${userId}/deactivate/`);
};

// Reactivate user
export const reactivateUser = async (userId: number): Promise<void> => {
  await axios.post(`/users/users/${userId}/reactivate/`);
};

// Login function
export const loginUser = async (username: string, password: string) => {
  const response = await axios.post('/users/auth/login/', {
    username,
    password,
  });
  
  return {
    token: response.data.token,
    user: {
      id: response.data.user_id,
      username: response.data.username,
      email: response.data.email,
      role: response.data.role,
      branch: response.data.branch,
    }
  };
};

// Change password
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  await axios.post('/users/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};
