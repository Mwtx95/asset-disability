import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';


type status = 'AVAILABLE' | 'MAINTENANCE' | 'BROKEN' | 'ASSIGNED';

export interface AssetItem {
    id: number;
    assetId: number;
    serialNumber: string;
    purchaseDate: Date;
    warrantyExpiryDate: Date;
    notes?: string;
    quantity: number;
    price: number;
    status: status;
    locationId: number;
    vendorId: number;
    assetName: string;
    locationName: string;
}

export interface CreateAssetItemDTO {
    assetId: number;
    serialNumber: string;
    locationId: number;
    vendorId: number;
    purchaseDate: Date;
    warrantyExpiryDate: Date;
    price: number;
    notes?: string;
}

async function getAssetItems() {
    const { data } = await axios.get<AssetItem[]>('/asset-items');
    return data;
}

async function getAssetItemsByAssetId(assetId: number) {
    const { data } = await axios.get<AssetItem[]>(`/asset-items/asset/${assetId}`);
    return data;
}

async function getAssetItemsByCategoryId(categoryId: number) {
    const { data } = await axios.get<AssetItem[]>(`/asset-items/category/${categoryId}`);
    return data;
}

async function createAssetItem(assetItem: CreateAssetItemDTO) {
    const { data } = await axios.post<AssetItem>('/asset-items', assetItem);
    return data;
}

async function updateAssetItem(assetItem: AssetItem) {
    const { data } = await axios.put<AssetItem>(
        `/asset-items/${assetItem.id}`,
        assetItem
    );
    return data;
}

async function disposeAssetItem(id: number) {
    const { data } = await axios.patch<AssetItem>(`/asset-items/${id}/dispose`);
    return data;
}

export const assetItemsQueryOptions = queryOptions({
    queryKey: ['asset-items'],
    queryFn: getAssetItems,
});

export const assetItemsByAssetIdQueryOptions = (assetId: number) =>
    queryOptions({
        queryKey: ['asset-items', 'asset', assetId],
        queryFn: () => getAssetItemsByAssetId(assetId),
    });

export const assetItemsByCategoryIdQueryOptions = (categoryId: number) =>
    queryOptions({
        queryKey: ['asset-items', 'category', categoryId],
        queryFn: () => getAssetItemsByCategoryId(categoryId),
    });

export function useCreateAssetItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAssetItem,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['asset-items'] });
            queryClient.invalidateQueries({
                queryKey: ['asset-items', 'asset', data.assetId]
            });
        },
    });
}

export function useUpdateAssetItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAssetItem,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['asset-items'] });
            queryClient.invalidateQueries({
                queryKey: ['asset-items', 'asset', data.assetId]
            });
        },
    });
}

export function useDisposeAssetItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: disposeAssetItem,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['asset-items'] });
        },
    });
}