import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { categoriesQueryOptions } from "@/queries/categories";
import { vendorsQueryOptions } from "@/queries/vendors";
import { Asset } from "@/queries/assets";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editAssetFormSchema = z.object({
  category: z.coerce.number().min(1, "Please select a category"),
  vendor: z.coerce.number().min(1, "Please select a vendor"),
});

type EditAssetFormSchema = z.infer<typeof editAssetFormSchema>;

interface EditAssetFormProps {
  asset: Asset;
  onSuccess: () => void;
}

export function EditAssetForm({ asset, onSuccess }: EditAssetFormProps) {
  const queryClient = useQueryClient();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: vendors } = useSuspenseQuery(vendorsQueryOptions);

  // Find current category and vendor IDs
  const currentCategory = categories.find(cat => cat.name === asset.categoryName);
  const currentVendor = vendors.find(vendor => 
    vendor.id === asset.vendorId || 
    vendor.id === Number(asset.vendor) || 
    vendor.name === asset.vendor
  );

  const form = useForm<EditAssetFormSchema>({
    resolver: zodResolver(editAssetFormSchema),
    defaultValues: {
      category: currentCategory?.id || 0,
      vendor: currentVendor?.id || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: EditAssetFormSchema) => {
      const updateData = {
        category: values.category,
        vendor: values.vendor,
      };

      const response = await axios.patch(`/assets/${asset.id}/`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-items"] });
      toast.success("Asset updated successfully");
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          "Failed to update asset";
      toast.error(errorMessage);
      console.error("Update Error:", error);
    },
  });

  function onSubmit(values: EditAssetFormSchema) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Read-only Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
            Asset Information (Read-only)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
              <Input 
                value={asset.name || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quantity</label>
              <Input 
                value={asset.quantity?.toString() || "0"} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <Input 
                value={asset.location || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Input 
                value={asset.status || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
          </div>

          {asset.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Textarea 
                value={asset.description} 
                disabled 
                className="bg-muted/50 text-muted-foreground resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium border-b pb-2">
            Editable Fields
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
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
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? "Updating..." : "Update Asset"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
