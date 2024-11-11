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
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  services: string;
}

export function VendorsSettings() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact: '',
    email: '',
    services: '',
  });

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-4 gap-4'>
        <Input
          placeholder='Company Name'
          value={newVendor.name}
          onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
        />
        <Input
          placeholder='Contact Person'
          value={newVendor.contact}
          onChange={e =>
            setNewVendor({ ...newVendor, contact: e.target.value })
          }
        />
        <Input
          placeholder='Email'
          type='email'
          value={newVendor.email}
          onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
        />
        <Button>
          <PlusIcon className='mr-2 h-4 w-4' /> Add Vendor
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Services</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map(vendor => (
            <TableRow key={vendor.id}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.contact}</TableCell>
              <TableCell>{vendor.email}</TableCell>
              <TableCell>{vendor.services}</TableCell>
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
