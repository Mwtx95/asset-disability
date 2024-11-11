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

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  categoriesQueryOptions,
  useCreateCategory,
  useUpdateCategory,
  useBlockCategory,
  Category,
} from '@/queries/categories';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define the schema for form validation
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoriesSettings() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: categories = [] } = useQuery(categoriesQueryOptions);
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

  // Update form values when editing category changes
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description ?? '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [editingCategory, form]);

  async function onSubmit(data: CategoryFormValues) {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          ...editingCategory,
          ...data,
        });
        setIsDialogOpen(false);
        setEditingCategory(null);
      } else {
        await createCategory.mutateAsync(data);
      }
      form.reset({
        name: '',
        description: '',
      });
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  }

  // Handle dialog close
  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingCategory(null);
      form.reset({
        name: '',
        description: '',
      });
    }
    setIsDialogOpen(open);
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
                  onClick={() => {
                    setEditingCategory(category);
                    setIsDialogOpen(true);
                  }}
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <label htmlFor='name'>Name</label>
                <Input
                  id='name'
                  {...form.register('name')}
                  placeholder='Category Name'
                />
              </div>
              <div className='grid gap-2'>
                <label htmlFor='description'>Description</label>
                <Input
                  id='description'
                  {...form.register('description')}
                  placeholder='Description (Optional)'
                />
              </div>
              <Button type='submit'>
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
