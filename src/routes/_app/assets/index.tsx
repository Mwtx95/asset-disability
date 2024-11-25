import { AddAssetForm } from '@/components/assets/add-asset-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categoriesStatsQueryOptions } from '@/queries/categories';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_app/assets/')({
  validateSearch: z.object({
    addAsset: z.string().optional().catch(''),
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(categoriesStatsQueryOptions);
  },
  component: AssetsRoute,
});

function AssetsRoute() {
  const navigate = Route.useNavigate();
  const { addAsset } = Route.useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: assets } = useSuspenseQuery(categoriesStatsQueryOptions);

  const [isAddModalOpen, setIsAddModalOpen] = useState(!!addAsset);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    navigate({ search: { addAsset: undefined } });
  };
  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex items-center justify-between gap-16'>
        <h1 className='text-2xl font-bold'>Assets</h1>
        <div className='flex-1 flex justify-center'>
          <Input
            placeholder='Search assets...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-1/2'
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className='w-4 h-4 mr-2' />
          Add Asset
        </Button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {assets.map(asset => (
          <Card
            key={asset.name}
            className='hover:shadow-md transition-shadow cursor-pointer'
            onClick={() =>
              navigate({
                to: '/assets/$assetCategory',
                params: { assetCategory: asset.name },
              })
            }
          >
            <CardHeader className='pb-2 flex flex-row justify-between'>
              <div>
                <h3 className='font-semibold text-lg mb-4'>{asset.name}</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                assets
              </p>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-green-500'></span>
                  Available: {asset.availableCount}
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-yellow-500'></span>
                  Maintenance: {asset.maintenanceCount}
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-blue-500'></span>
                  Rented: {asset.brokenCount}
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-red-500'></span>
                  Assigned: {asset.assignedCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <AddAssetForm onSuccess={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
