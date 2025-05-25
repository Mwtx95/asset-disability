import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';


type status = 'AVAILABLE' | 'MAINTENANCE' | 'BROKEN' | 'ASSIGNED';

export interface AssetItem {
    id?: number;  // Optional since backend doesn't provide it
    asset_name: string;
    assetId: number;
    serial_number: string;
    purchaseDate: Date;
    warrantyExpiryDate: Date;
    notes?: string;
    quantity: number;
    price: number;
    status: status;
    locationId: number;
    vendorId: number;
    asset: string;
    location_name: string;
    // Add computed ID based on serial number for frontend use
    _computedId?: string;
}

export interface CreateAssetItemDTO {
    assetId: number;
    serial_number: string;
    locationId: number;
    vendorId: number;
    purchaseDate: Date;
    warrantyExpiryDate: Date;
    price: number;
    notes?: string;
}

async function getAssetItems() {
    const { data } = await axios.get<AssetItem[]>('/assetitems/');
    // Add computed IDs for frontend use based on serial number and asset
    return data.map(item => ({
        ...item,
        _computedId: `${item.asset}_${item.serial_number}`.replace(/[^a-zA-Z0-9]/g, '_'),
        id: item.id || undefined
    }));
}

async function getAssetItemsByAssetId(assetId: number) {
    const { data } = await axios.get<AssetItem[]>(`/assetitems/asset/${assetId}/`);
    // Add computed IDs for frontend use based on serial number and asset
    return data.map(item => ({
        ...item,
        _computedId: `${item.asset}_${item.serial_number}`.replace(/[^a-zA-Z0-9]/g, '_'),
        id: item.id || undefined
    }));
}

async function getAssetItemsByCategoryId(categoryId: number) {
    const { data } = await axios.get<AssetItem[]>(`/assetitems/category/${categoryId}/`);
    // Add computed IDs for frontend use based on serial number and asset
    return data.map(item => ({
        ...item,
        _computedId: `${item.asset}_${item.serial_number}`.replace(/[^a-zA-Z0-9]/g, '_'),
        id: item.id || undefined
    }));
}

async function createAssetItem(assetItem: CreateAssetItemDTO) {
    const { data } = await axios.post<AssetItem>('/assetitems/', assetItem);
    return data;
}

async function updateAssetItem(assetItem: AssetItem) {
    const { data } = await axios.put<AssetItem>(
        `/assetitems/${assetItem.id}/`,
        assetItem
    );
    return data;
}

async function disposeAssetItem(id: number) {
    const { data } = await axios.patch<AssetItem>(`/assetitems/${id}/dispose/`);
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