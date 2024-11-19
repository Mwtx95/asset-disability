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
import { Asset, assetsQueryOptions } from '@/queries/assets';
import { categoriesQueryOptions } from '@/queries/categories';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusCircle, Search, ArrowLeftIcon } from 'lucide-react';
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

  const assetsByCategory = filteredAssets?.reduce(
    (acc, asset) => {
      // Initialize category if it doesn't exist
      if (!acc[asset.categoryName]) {
        acc[asset.categoryName] = {
          name: asset.name,
          categoryName: asset.categoryName,
          numberOfAssets: 0,
          Available: 0,
          Maintenance: 0,
          Rented: 0,
        };
      }

      // Increment total count
      acc[asset.categoryName].numberOfAssets++;
      // Increment status count
      switch (asset.status) {
        case 'Available':
          acc[asset.categoryName].Available++;
          break;
        case 'Maintenance':
          acc[asset.categoryName].Maintenance++;
          break;
        case 'Rented':
          acc[asset.categoryName].Rented++;
          break;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        categoryName: string;
        numberOfAssets: number;
        Available: number;
        Maintenance: number;
        Rented: number;
      }
    >
  );

  // Convert the object to array format
  const assetsByCategoryArray = Object.values(assetsByCategory || {});

  console.log(JSON.stringify(assetsByCategoryArray, null, 2));

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Assets</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className='w-4 h-4 mr-2' />
          Add Asset
        </Button>
      </div>

      <div className='flex gap-4 items-center'>
        <div className='flex-1'>
          <Input
            placeholder='Search assets...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full'
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='w-48'>
            <SelectValue />
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
          <SelectTrigger className='w-48'>
            <SelectValue />
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {assetsByCategoryArray.map(category => (
          <Card key={category.name}>
            <CardHeader>{category.name}</CardHeader>
            <CardContent>
              <p>{category.numberOfAssets}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <AddAssetForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
