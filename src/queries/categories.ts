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
  isBlocked: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

async function fetchCategories() {
  const { data } = await axios.get<Category[]>('/categories');
  return data;
}

async function createCategory(category: CreateCategoryDTO) {
  const { data } = await axios.post<Category>('/categories', category);
  return data;
}

async function updateCategory(category: Category) {
  const { data } = await axios.put<Category>(
    `/categories/${category.id}`,
    category
  );
  return data;
}

async function blockCategory(id: number) {
  const { data } = await axios.patch<Category>(`/categories/${id}/block`);
  return data;
}

export const categoriesQueryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: fetchCategories,
});

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useBlockCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
