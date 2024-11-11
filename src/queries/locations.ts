import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

export interface Location {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'room' | 'area';
  parentLocation?: string;
  description?: string;
  isBlocked?: boolean;
}

interface CreateLocationDTO {
  name: string;
  type: 'building' | 'floor' | 'room' | 'area';
  parentLocation?: string;
  description?: string;
}

export const locationQueryOptions = queryOptions({
  queryKey: ['locations'],
  queryFn: async () => {
    const { data } = await axios.get<Location[]>('/locations');
    return data;
  },
});

async function updateLocation(location: Location) {
  const { data } = await axios.put<Location>(
    `/locations/${location.id}`,
    location
  );
  return data;
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location: CreateLocationDTO) => {
      const { data } = await axios.post<Location>('/locations', location);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

async function blockLocation(id: string) {
  const { data } = await axios.patch<Location>(`/locations/${id}/block`);
  return data;
}

export function useBlockLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
