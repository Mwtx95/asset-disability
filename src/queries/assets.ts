import {
  QueryFunctionContext,
  queryOptions,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export interface Asset {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  assignedTo: string;
  status: string;
  location: string;
  createdAt: string;
  updatedAt: null;
  quantity?: number;
  vendor?: string;
  vendorId?: number;
  serial_number?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentLocation?: string;
  condition?: string;
  warrantyInfo?: string;
  warrantyExpiryDate?: string;
  notes?: string;
}

export const assetsQueryOptions = queryOptions({
  queryKey: ['assets'],
  queryFn: fetchAssets,
}); 

export const assetQueryOptions = (assetId: string) =>
  queryOptions({
    queryKey: ['assets', assetId],
    queryFn: fetchAsset,

  });

async function fetchAssets() {
  const { data } = await axios.get<Asset[]>('/assets/');
  console.log('API Response for assets:', data);
  return data;
}

async function fetchAsset({ queryKey }: QueryFunctionContext) {
  const [_, assetId] = queryKey;
  const { data } = await axios.get<Asset>(`/assets/${assetId}`);
  console.log('API Response for single asset:', data);
  return data;
}

interface TransferAssetMutationArgs {
  assetId: string;
  locationId: number;
}

export function useTransferAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, locationId }: TransferAssetMutationArgs) => {
      const { data } = await axios.patch<Asset>(
        `/assets/${assetId}/transfer/${locationId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset transferred successfully');
    },
    onError: () => {
      toast.error('Failed to transfer asset');
    },
  });
}
