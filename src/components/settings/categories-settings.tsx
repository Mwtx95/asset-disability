import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  LockIcon,
  UnlockIcon,
} from 'lucide-react';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  categoryQueryOptions,
  useCreateCategory,
  useUpdateCategory,
  useBlockCategory,
} from '@/queries/categories';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isBlocked: boolean;
}

// Define the schema for form validation
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoriesSettings() {
  const { data: categories = [], isLoading } = useQuery(categoryQueryOptions);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const blockCategory = useBlockCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    try {
      await createCategory.mutateAsync(data);
      form.reset();
    } catch (error) {
      // Handle error - you might want to add toast notification here
      console.error('Failed to create category:', error);
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        {/* Add Shadcn Spinner here if you want */}
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-4'>
        <Input
          placeholder='Category Name'
          {...form.register('name')}
          aria-invalid={!!form.formState.errors.name}
          disabled={createCategory.isPending}
        />
        <Input
          placeholder='Description'
          {...form.register('description')}
          aria-invalid={!!form.formState.errors.description}
          disabled={createCategory.isPending}
        />
        <Button type='submit' disabled={createCategory.isPending}>
          {createCategory.isPending ? (
            <>Loading...</>
          ) : (
            <>
              <PlusIcon className='mr-2 h-4 w-4' /> Add Category
            </>
          )}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='w-20'>Status</TableHead>
            <TableHead className='w-28 text-center'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description || 'No description'}</TableCell>
              <TableCell className='w-20'>
                <Badge variant={category.isBlocked ? 'destructive' : 'default'}>
                  {category.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
              </TableCell>
              <TableCell className='w-28 flex justify-around'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='hover:bg-sky-200'
                >
                  <PencilIcon className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn(
                    'hover:bg-red-300',
                    category.isBlocked && 'text-red-500 hover:text-red-700'
                  )}
                  onClick={() => blockCategory.mutateAsync(category.id)}
                >
                  {category.isBlocked ? (
                    <LockIcon className='h-4 w-4' />
                  ) : (
                    <UnlockIcon className='h-4 w-4' />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
