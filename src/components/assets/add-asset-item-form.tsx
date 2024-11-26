import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ASSET_STATUSES } from '@/lib/constants';
import { vendorsQueryOptions } from '@/queries/vendors';
import { assetsQueryOptions } from '@/queries/assets';
import { categoriesQueryOptions } from '@/queries/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  assetId: z.coerce.number().min(1, 'Please select an asset'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  vendorId: z.coerce.number().min(1, 'Please select a vendor'),
  status: z.string().min(1, 'Please select a status'),
});

type FormSchema = z.infer<typeof formSchema>;

interface AddAssetItemFormProps {
  onSuccess: () => void;
  categoryId: number;
}

export function AddAssetItemForm({ onSuccess, categoryId }: AddAssetItemFormProps & { categoryId: number }) {
  const queryClient = useQueryClient();
  const { data: vendors } = useSuspenseQuery(vendorsQueryOptions);
  const { data: assets } = useSuspenseQuery(assetsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);

  // Find the category name from the ID
  const category = categories.find(cat => cat.id === categoryId);
  const filteredAssets = assets.filter(asset => asset.categoryName === category?.name);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: FormSchema) => {
      const data = {
        ...values,
      };
      const response = await axios.post('/asset-items', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-items'] });
      toast.success('Asset received successfully');
      form.reset();
      onSuccess();
    },
    onError: error => {
      toast.error('Failed to receive asset');
      console.error(error);
    },
  });

  function onSubmit(values: FormSchema) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='assetId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredAssets.map((asset) => (
                    <SelectItem key={asset.id} value={String(asset.id)}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='quantity'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder='Enter quantity' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder='Enter price' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='vendorId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a vendor' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem
                      key={vendor.id}
                      value={vendor.id.toString()}
                    >
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ASSET_STATUSES).map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={mutation.isPending}>
          {mutation.isPending ? 'Receiving...' : 'Receive Asset'}
        </Button>
      </form>
    </Form>
  );
}
