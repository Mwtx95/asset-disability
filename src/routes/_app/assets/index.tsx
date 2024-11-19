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
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

const ASSET_STATUSES = ['All Statuses', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export const Route = createFileRoute('/_app/assets/')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(assetsQueryOptions);
  },
  component: AssetsRoute,
});

function AssetsRoute() {
  const navigate = Route.useNavigate();
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

  const assetsByAssetName = filteredAssets?.reduce(
    (acc, asset) => {
      // Initialize category if it doesn't exist
      if (!acc[asset.name]) {
        acc[asset.name] = {
          id: asset.id.toString(),
          name: asset.name,
          categoryName: asset.categoryName,
          numberOfAssets: 0,
          Available: 0,
          Maintenance: 0,
          Rented: 0,
        };
      }

      // Increment total count
      acc[asset.name].numberOfAssets++;
      // Increment status count
      switch (asset.status) {
        case 'Available':
          acc[asset.name].Available++;
          break;
        case 'Maintenance':
          acc[asset.name].Maintenance++;
          break;
        case 'Rented':
          acc[asset.name].Rented++;
          break;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        id: string;
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
  const assetsByAssetNameArray = Object.values(assetsByAssetName || {});

  console.log(JSON.stringify(assetsByAssetNameArray, null, 2));

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
        {assetsByAssetNameArray.map(asset => (
          <Card
            key={asset.name}
            className='hover:shadow-md transition-shadow cursor-pointer'
            onClick={() =>
              navigate({
                to: '/assets/$assetName',
                params: { assetName: asset.name },
              })
            }
          >
            <CardHeader className='pb-2 flex flex-row justify-between'>
              <div>
                <h3 className='font-semibold text-lg'>{asset.name}</h3>
                <p className='text-sm text-muted-foreground'>
                  {asset.categoryName}
                </p>
              </div>
              <p className='text-sm text-muted-foreground'>
                {asset.numberOfAssets} assets
              </p>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-green-500'></span>
                  Available: {asset.Available}
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-yellow-500'></span>
                  Maintenance: {asset.Maintenance}
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-blue-500'></span>
                  Rented: {asset.Rented}
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
          <AddAssetForm onSuccess={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
