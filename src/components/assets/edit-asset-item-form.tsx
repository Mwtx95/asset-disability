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

import { ASSET_STATUSES } from "@/lib/constants";
import { AssetItem } from "@/queries/assetsItems";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editAssetItemFormSchema = z.object({
  status: z.string().min(1, "Please select a status"),
});

type EditAssetItemFormSchema = z.infer<typeof editAssetItemFormSchema>;

interface EditAssetItemFormProps {
  assetItem: AssetItem;
  onSuccess: () => void;
}

export function EditAssetItemForm({ assetItem, onSuccess }: EditAssetItemFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditAssetItemFormSchema>({
    resolver: zodResolver(editAssetItemFormSchema),
    defaultValues: {
      status: assetItem.status,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: EditAssetItemFormSchema) => {
      const updateData = {
        ...assetItem,
        status: values.status,
      };

      const response = await axios.patch(`/assetitems/by-serial/${assetItem.serial_number}/`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-items"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Asset item status updated successfully");
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          "Failed to update asset item status";
      toast.error(errorMessage);
      console.error("Update Error:", error);
    },
  });

  function onSubmit(values: EditAssetItemFormSchema) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Read-only Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground border-b pb-2">
            Asset Item Information (Read-only)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
              <Input 
                value={assetItem.serial_number || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
              <Input 
                value={assetItem.asset_name || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <Input 
                value={assetItem.location_name || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Price</label>
              <Input 
                value={`$${assetItem.price?.toString() || "0"}` || ""} 
                disabled 
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
          </div>

          {assetItem.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <Textarea 
                value={assetItem.notes} 
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
            Editable Field
          </h4>
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ASSET_STATUSES)
                      .filter(status => status !== ASSET_STATUSES.ALL)
                      .map((status) => (
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
            {mutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
