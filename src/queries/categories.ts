import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
}

export const categoryQueryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: fetchCategories,
});

async function fetchCategories() {
  const { data } = await axios.get<Category[]>('/categories');
  return data;
}

async function createCategory(category: CreateCategoryDTO) {
  const { data } = await axios.post<Category>('/categories', category);
  return data;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
