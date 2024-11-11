import { queryOptions } from '@tanstack/react-query';
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
}

export const assetsQueryOptions = queryOptions({
  queryKey: ['assets'],
  queryFn: fetchAssets,
});

async function fetchAssets() {
  const { data } = await axios.get<Asset[]>('/assets');
  return data;
}
