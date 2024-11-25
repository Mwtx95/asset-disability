import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Asset {
  id: string;
  name: string;
  department: string;
  status: 'in-use' | 'available' | 'maintenance';
  assignedTo?: string;
}

interface AssetsListModalProps {
  assets: Asset[];
  children: React.ReactNode;
}

export function AssetsListModal({ assets, children }: AssetsListModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Assets</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{asset.department}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      asset.status === 'available'
                        ? 'success'
                        : asset.status === 'in-use'
                        ? 'default'
                        : 'warning'
                    }
                  >
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>{asset.assignedTo || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
