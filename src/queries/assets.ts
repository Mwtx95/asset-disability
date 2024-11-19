import { QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export interface Asset {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  assignedTo: string;
  status: string;
  locationName: string;
  createdAt: string;
  updatedAt: null;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentLocation?: string;
  condition?: string;
  warrantyInfo?: string;
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
  const { data } = await axios.get<Asset[]>('/assets');
  return data;
}

async function fetchAsset({ queryKey }: QueryFunctionContext) {
  const [_, assetId] = queryKey;
  const { data } = await axios.get<Asset>(`/assets/${assetId}`);
  return data;
}
