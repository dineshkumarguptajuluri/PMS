import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface User {
  id: number;
  email: string;
  role: string;
  clientProfile?: {
    id: number;
    legalName: string;
  };
}

export interface Project {
  id: number;
  title: string;
  utilityFocus: string;
  managerId: number | null;
  clientId: number | null;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  pages: number;
  currentPage: number;
}

// Hook for fetching projects
export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects', 'discovery'],
    queryFn: async () => {
      const res = await apiClient.get('/projects/discovery');
      return res.data;
    },
  });
};

// Hook for fetching managers
export const useManagers = () => {
  return useQuery<User[]>({
    queryKey: ['users', 'MANAGER'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users?role=MANAGER');
      // For managers, we currently get the raw array back because backend logic
      // might not be paginated for all roles yet, or it returns the paginated object.
      // Let's assume the backend update applied to all roles.
      return Array.isArray(res.data) ? res.data : res.data.users;
    },
  });
};

// Hook for fetching paginated clients
export const useClients = (page: number, limit: number, search: string) => {
  return useQuery<PaginatedUsers>({
    queryKey: ['users', 'CLIENT', page, limit, search],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users', {
        params: { role: 'CLIENT', page, limit, search },
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData, // Smooth transitions
  });
};

// Hook for assigning client to project
export const useAssignClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, clientId }: { projectId: number; clientId: number }) => {
      const res = await apiClient.post(`/admin/projects/${projectId}/assign-client`, { clientId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
