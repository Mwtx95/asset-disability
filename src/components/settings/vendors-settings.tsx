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
import { useCreateVendor, useUpdateVendor, useBlockVendor, vendorsQueryOptions } from '@/queries/vendors';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function VendorsSettings() {
  const { data: vendors = [] } = useQuery(vendorsQueryOptions);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const blockVendor = useBlockVendor();

  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    description: '',
  });

  const handleAddVendor = async () => {
    try {
      await createVendor.mutateAsync({
        name: newVendor.name,
        contactPerson: newVendor.contactPerson,
        phoneNumber: newVendor.phoneNumber,
        email: newVendor.email,
        description: newVendor.description,
      });
      // Reset form
      setNewVendor({
        name: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        description: '',
      });
    } catch (error) {
      console.error('Failed to create vendor:', error);
    }
  };

  const handleBlockVendor = async (id: number) => {
    try {
      await blockVendor.mutateAsync(id);
    } catch (error) {
      console.error('Failed to block vendor:', error);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-5 gap-4'>
        <Input
          placeholder='Company Name'
          value={newVendor.name}
          onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
        />
        <Input
          placeholder='Contact Person'
          value={newVendor.contactPerson}
          onChange={e =>
            setNewVendor({ ...newVendor, contactPerson: e.target.value })
          }
        />
        <Input
          placeholder='Phone Number'
          value={newVendor.phoneNumber}
          onChange={e =>
            setNewVendor({ ...newVendor, phoneNumber: e.target.value })
          }
        />
        <Input
          placeholder='Email'
          type='email'
          value={newVendor.email}
          onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
        />
        <Button onClick={handleAddVendor} disabled={createVendor.isPending}>
          <PlusIcon className='mr-2 h-4 w-4' /> 
          {createVendor.isPending ? 'Adding...' : 'Add Vendor'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map(vendor => (
            <TableRow key={vendor.id}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.contactPerson}</TableCell>
              <TableCell>{vendor.phoneNumber}</TableCell>
              <TableCell>{vendor.email}</TableCell>
              <TableCell>{vendor.status}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button 
                    variant='ghost' 
                    size='icon'
                    onClick={() => handleBlockVendor(vendor.id)}
                    disabled={blockVendor.isPending}
                  >
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
