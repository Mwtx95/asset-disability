import { AddAssetForm } from '@/components/assets/add-asset-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assetsQueryOptions } from '@/queries/assets';
import { categoriesQueryOptions } from '@/queries/categories';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

const ASSET_STATUSES = ['All Statuses', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export const Route = createFileRoute('/_app/assets')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(assetsQueryOptions);
  },
  component: AssetsRoute,
});

function AssetsRoute() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const { data: assets } = useSuspenseQuery(assetsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' ||
      asset.categoryName === selectedCategory;
    const matchesStatus =
      selectedStatus === 'All Statuses' || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className='container mx-auto p-2'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Assets</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Add Asset
        </Button>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className='sm:max-w-[450px]'>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <AddAssetForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search assets...'
                className='pl-8'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className='flex gap-2'>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='All Categories'>All Categories</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[calc(100vh-20rem)]'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredAssets?.map(asset => (
                <Card
                  key={asset.id}
                  className='hover:bg-accent/50 cursor-pointer'
                >
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <div className='font-semibold'>{asset.name}</div>
                    <Badge
                      variant={
                        asset.status === 'Available'
                          ? 'success'
                          : asset.status === 'MAINTENANCE'
                            ? 'warning'
                            : 'destructive'
                      }
                    >
                      {asset.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className='text-sm space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Category</span>
                        <span>{asset.categoryName}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Location</span>
                        <span>{asset.locationName}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Last Updated
                        </span>
                        <span>{asset.updatedAt ?? 'N/A'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Assigned To
                        </span>
                        <span>{asset.assignedTo ?? 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
