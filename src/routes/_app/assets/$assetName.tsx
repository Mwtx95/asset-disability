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
      <div className='relative w-full overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[150px]'>Name</TableHead>
              <TableHead className='min-w-[120px]'>Category</TableHead>
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
                <TableCell className='font-medium'>{asset.name}</TableCell>
                <TableCell>{asset.categoryName}</TableCell>
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
                  <Button variant='outline'>Assign</Button>
                  <Button>Transfer</Button>
                  <Button variant='secondary'>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
