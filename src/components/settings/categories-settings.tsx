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
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export function CategoriesSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  return (
    <div className='space-y-6'>
      <div className='flex gap-4'>
        <Input
          placeholder='Category Name'
          value={newCategory.name}
          onChange={e =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
        />
        <Input
          placeholder='Description'
          value={newCategory.description}
          onChange={e =>
            setNewCategory({ ...newCategory, description: e.target.value })
          }
        />
        <Button>
          <PlusIcon className='mr-2 h-4 w-4' /> Add Category
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button variant='ghost' size='icon'>
                    <PencilIcon className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <TrashIcon className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
