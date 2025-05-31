import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

// Transfer Status Enum
export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
}

// Transfer interfaces
export interface Transfer {
  id: number;
  asset_item: number;
  asset_item_name: string;
  asset_item_serial_number: string;
  asset_name: string;
  from_location: number;
  from_location_name: string;
  to_location: number;
  to_location_name: string;
  requested_by: number;
  requested_by_name: string;
  approved_by?: number;
  approved_by_name?: string;
  status: TransferStatus;
  request_date: string;
  approval_date?: string;
  completion_date?: string;
  notes?: string;
  reason?: string;
}

export interface CreateTransferData {
  asset_item: number;
  to_location: number;
  reason?: string;
  notes?: string;
}

export interface TransferActionData {
  notes?: string;
}

// Query Options
export const transfersQueryOptions = queryOptions({
  queryKey: ['transfers'],
  queryFn: async () => {
    const { data } = await axios.get<Transfer[]>('/transfers/');
    return data;
  },
});

export const incomingTransfersQueryOptions = queryOptions({
  queryKey: ['transfers', 'incoming'],
  queryFn: async () => {
    const { data } = await axios.get<Transfer[]>('/transfers/incoming/');
    return data;
  },
});

export const outgoingTransfersQueryOptions = queryOptions({
  queryKey: ['transfers', 'outgoing'],
  queryFn: async () => {
    const { data } = await axios.get<Transfer[]>('/transfers/outgoing/');
    return data;
  },
});

// Mutations
export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transferData: CreateTransferData) => {
      const { data } = await axios.post<Transfer>('/transfers/', transferData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['assetitems'] }); // Refresh asset items
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: TransferActionData }) => {
      const { data: response } = await axios.post<Transfer>(`/transfers/${id}/approve/`, data || {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['assetitems'] }); // Refresh asset items
    },
  });
}

export function useDeclineTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: TransferActionData }) => {
      const { data: response } = await axios.post<Transfer>(`/transfers/${id}/decline/`, data || {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['assetitems'] }); // Refresh asset items
    },
  });
}

// Utility functions
export function getStatusBadgeVariant(status: TransferStatus) {
  switch (status) {
    case TransferStatus.PENDING:
      return 'secondary';
    case TransferStatus.APPROVED:
      return 'default';
    case TransferStatus.DECLINED:
      return 'destructive';
    case TransferStatus.IN_TRANSIT:
      return 'outline';
    case TransferStatus.COMPLETED:
      return 'default';
    default:
      return 'outline';
  }
}

export function getStatusDisplayName(status: TransferStatus) {
  return status.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}
