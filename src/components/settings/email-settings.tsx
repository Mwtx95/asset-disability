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
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface EmailRecipient {
  id: string;
  email: string;
  name: string;
}

export function EmailSettings() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ email: '', name: '' });

  return (
    <div className='space-y-6'>
      <div className='flex gap-4'>
        <Input
          placeholder='Name'
          value={newRecipient.name}
          onChange={e =>
            setNewRecipient({ ...newRecipient, name: e.target.value })
          }
        />
        <Input
          type='email'
          placeholder='Email Address'
          value={newRecipient.email}
          onChange={e =>
            setNewRecipient({ ...newRecipient, email: e.target.value })
          }
        />
        <Button>
          <PlusIcon className='mr-2 h-4 w-4' /> Add Recipient
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipients.map(recipient => (
            <TableRow key={recipient.id}>
              <TableCell>{recipient.name}</TableCell>
              <TableCell>{recipient.email}</TableCell>
              <TableCell>
                <Button variant='ghost' size='icon'>
                  <TrashIcon className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
