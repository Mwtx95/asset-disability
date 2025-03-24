import {
    queryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

type status = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Vendor {
    id: number;
    name: string;
    contactPerson: string;
    description: string;
    phoneNumber: string;
    status: string;
    email: string;
}

export interface CreateVendorDTO {
    name: string;
    contactPerson: string;
    description?: string;
    phoneNumber: string;
    email: string;
}

async function getVendors() {
    const { data } = await axios.get<Vendor[]>('/vendors/');
    return data;
}

async function createVendor(vendor: CreateVendorDTO) {
    const { data } = await axios.post<Vendor>('/vendors/', vendor);
    return data;
}

async function updateVendor(vendor: Vendor) {
    const { data } = await axios.put<Vendor>(
        `/vendors/${vendor.id}`,
        vendor
    );
    return data;
}

async function blockVendor(id: number) {
    const { data } = await axios.patch<Vendor>(`/vendors/${id}/block`);
    return data;
}

export const vendorsQueryOptions = queryOptions({
    queryKey: ['vendors'],
    queryFn: getVendors,
});

export function useCreateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}

export function useBlockVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: blockVendor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
    });
}