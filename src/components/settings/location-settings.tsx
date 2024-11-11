import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PencilIcon, PlusIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  locationQueryOptions,
  useCreateLocation,
  useBlockLocation,
} from '@/queries/locations';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function LocationSettings() {
  const { data: locations = [] } = useQuery(locationQueryOptions);
  const blockLocation = useBlockLocation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Parent Location</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className='w-20'>Status</TableHead>
          <TableHead className='w-28 text-center'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map(location => (
          <TableRow key={location.id}>
            <TableCell>{location.name}</TableCell>
            <TableCell className='capitalize'>{location.type}</TableCell>
            <TableCell>{location.parentLocation}</TableCell>
            <TableCell>{location.description || 'No description'}</TableCell>
            <TableCell className='w-20'>
              <Badge variant={location.isBlocked ? 'destructive' : 'default'}>
                {location.isBlocked ? 'Blocked' : 'Active'}
              </Badge>
            </TableCell>
            <TableCell className='w-28 flex justify-around'>
              <Button variant='ghost' size='icon' className='hover:bg-sky-200'>
                <PencilIcon className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className={cn(
                  'hover:bg-red-300',
                  location.isBlocked && 'text-red-500 hover:text-red-700'
                )}
                onClick={() => blockLocation.mutate(location.id)}
              >
                {location.isBlocked ? (
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
  );
}
