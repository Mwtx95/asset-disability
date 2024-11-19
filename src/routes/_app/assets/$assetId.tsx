import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { assetQueryOptions } from '@/queries/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/assets/$assetId')({
  loader: ({ context: { queryClient }, params: { assetId } }) => {
    return queryClient.ensureQueryData(assetQueryOptions(assetId));
  },
  component: AssetDetailsRoute,
});

function AssetDetailsRoute() {
  const { assetId } = Route.useParams();
  const { data: asset } = useSuspenseQuery(assetQueryOptions(assetId));

  if (!asset) return null;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{asset.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Category" value={asset.categoryName} />
            <DetailItem label="Status" value={asset.status} />
            {/* <DetailItem label="Serial Number" value={asset.serialNumber} /> */}
            {/* <DetailItem label="Purchase Date" value={new Date(asset.purchaseDate).toLocaleDateString()} /> */}
            <DetailItem label="Purchase Price" value={`$${asset.purchasePrice}`} />
            {/* <DetailItem label="Current Location" value={asset.currentLocation} /> */}
            <DetailItem label="Assigned To" value={asset.assignedTo || 'Not Assigned'} />
            {/* <DetailItem label="Condition" value={asset.condition} /> */}
            <DetailItem label="Warranty Info" value={asset.warrantyInfo || 'N/A'} />
            <DetailItem label="Notes" value={asset.notes || 'No notes'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
