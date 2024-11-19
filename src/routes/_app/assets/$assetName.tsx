import { assetQueryOptions, assetsQueryOptions } from '@/queries/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ASSET_STATUS_BADGE_MAP } from '@/lib/constants';
import { Pencil, UserPlus, ArrowRightLeft } from 'lucide-react';

export const Route = createFileRoute('/_app/assets/$assetName')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(assetsQueryOptions);
  },
  component: AssetDetailsRoute,
});

function AssetDetailsRoute() {
  const { assetName } = Route.useParams();
  const { data: assets } = useSuspenseQuery(assetsQueryOptions);

  const filteredAssetsByAssetName = assets?.filter(
    asset => asset.name === assetName
  );

  return (
    <div className='container mx-auto py-6'>
      {filteredAssetsByAssetName?.[0] && (
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {filteredAssetsByAssetName[0].name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Category: {filteredAssetsByAssetName[0].categoryName}
          </p>
        </div>
      )}
      <div className='relative w-full overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[120px]'>Location</TableHead>
              <TableHead className='min-w-[150px]'>Assigned To</TableHead>
              <TableHead className='min-w-[100px]'>Status</TableHead>
              <TableHead className='text-center min-w-[160px]'>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssetsByAssetName?.map(asset => (
              <TableRow key={asset.id}>
                <TableCell>{asset.locationName}</TableCell>
                <TableCell className='text-center'>
                  {asset.assignedTo}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      ASSET_STATUS_BADGE_MAP[
                        asset.status as keyof typeof ASSET_STATUS_BADGE_MAP
                      ]?.color ||
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {asset.status}
                  </span>
                </TableCell>
                <TableCell className='flex gap-2 justify-center'>
                  <Button variant='secondary' size="sm">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant='outline' size="sm">
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                  <Button size="sm">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
