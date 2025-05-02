import React, { useState } from "react";
import { AddAssetItemForm } from "@/components/assets/add-asset-item-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ASSET_STATUS_BADGE_MAP, ASSET_STATUSES } from "@/lib/constants";
import { assetsQueryOptions, useTransferAssetMutation } from "@/queries/assets";
import {
  assetItemsByCategoryIdQueryOptions,
  assetItemsQueryOptions,
} from "@/queries/assetsItems";
import { locationQueryOptions } from "@/queries/locations";
import { vendorsQueryOptions } from "@/queries/vendors";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import { ArrowLeft, ArrowRightLeft, Pencil, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const transferFormSchema = z.object({
  locationId: z.coerce.number().min(1, "Please select a location"),
});

const editAssetItemFormSchema = z.object({
  status: z.string().min(1, "Please select a status"),
  location: z.coerce.number().min(1, "Please select a location"),
  vendor: z.coerce.number().min(1, "Please select a vendor"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  serial_number: z.string().optional(),
  notes: z.string().optional(),
  purchase_date: z.string().optional(),
  warranty_expiry_date: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;
type EditAssetItemFormValues = z.infer<typeof editAssetItemFormSchema>;

export const Route = createFileRoute("/_app/assets/$assetCategory")({
  loader: ({ context: { queryClient }, params: { assetCategory } }) => {
    const [categoryId] = assetCategory.split("_");
    queryClient.ensureQueryData(
      assetItemsByCategoryIdQueryOptions(parseInt(categoryId))
    );
  },
  component: AssetDetailsRoute,
});

function AssetDetailsRoute() {
  const { assetCategory } = Route.useParams();
  const [categoryId, categoryName] = assetCategory.split("_");
  const { data: categoryAssets } = useSuspenseQuery(
    assetItemsByCategoryIdQueryOptions(parseInt(categoryId))
  );
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);
  const { data: vendors = [] } = useSuspenseQuery(vendorsQueryOptions);
  const transferAsset = useTransferAssetMutation();
  const queryClient = useQueryClient();
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<any>(null);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
  });

  const editForm = useForm<EditAssetItemFormValues>({
    resolver: zodResolver(editAssetItemFormSchema),
    defaultValues: {
      status: "",
      location: undefined,
      vendor: undefined,
      price: 0,
      serial_number: "",
      notes: "",
      purchase_date: "",
      warranty_expiry_date: "",
    },
  });

  // Reset and populate the edit form when an item is selected for editing
  const handleEditItem = (item: any) => {
    setSelectedItemForEdit(item);

    // Reset form with the item's current values
    editForm.reset({
      status: item.status,
      location: item.locationId,
      vendor: item.vendorId,
      price: item.price,
      serial_number: item.serial_number,
      notes: item.notes || "",
      purchase_date: item.purchase_date || "",
      warranty_expiry_date: item.warranty_expiry_date || "",
    });

    setIsEditDialogOpen(true);
  };

  // Mutation for updating asset item
  const updateAssetItem = useMutation({
    mutationFn: async (values: EditAssetItemFormValues) => {
      // Add the item ID to the update data
      const updateData = {
        ...values,
        id: selectedItemForEdit.id,
        asset: selectedItemForEdit.assetId,
      };

      const { data } = await axios.put(
        `/assetitems/${selectedItemForEdit.id}/`,
        updateData
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-items"] });
      queryClient.invalidateQueries({
        queryKey: ["asset-items", "category", parseInt(categoryId)],
      });

      // Show success message and close dialog
      toast.success("Asset item updated successfully");
      setIsEditDialogOpen(false);
      setSelectedItemForEdit(null);
    },
    onError: (error) => {
      toast.error("Failed to update asset item");
      console.error("Update error:", error);
    },
  });

  // Handle edit form submission
  const onSubmitEdit = (values: EditAssetItemFormValues) => {
    updateAssetItem.mutate(values);
  };

  // Group assets by assetId AND name to handle multiple assets in the same category
  const groupedAssets = categoryAssets.reduce(
    (acc, asset) => {
      // Create a unique key combining asset ID and name
      const assetKey = `${asset.assetId}_${asset.asset_name}`;

      if (!acc[assetKey]) {
        acc[assetKey] = {
          id: asset.assetId,
          name: asset.asset_name,
          quantity: 0,
          status: asset.status,
          items: [],
        };
      }
      acc[assetKey].quantity++;
      acc[assetKey].items.push(asset);
      return acc;
    },
    {} as Record<
      string,
      {
        id: number;
        name: string;
        quantity: number;
        status: string;
        items: typeof categoryAssets;
      }
    >
  );

  const assets = Object.values(groupedAssets);
  async function onSubmit(values: TransferFormValues) {
    try {
      await transferAsset.mutateAsync({
        assetId: selectedAssetId!.toString(),
        locationId: values.locationId,
      });
      setIsTransferDialogOpen(false);
      form.setValue("locationId", undefined as any);
    } catch (error) {
      console.error("Failed to transfer asset:", error);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          to="/assets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {categoryName}
            </h2>
          </div>
          <Dialog
            open={isReceiveDialogOpen}
            onOpenChange={setIsReceiveDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Receive Asset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Receive Asset</DialogTitle>
              </DialogHeader>
              <AddAssetItemForm
                onSuccess={() => setIsReceiveDialogOpen(false)}
                categoryId={parseInt(categoryId)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Asset Name</TableHead>
              <TableHead className="min-w-[100px]">Total Quantity</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <React.Fragment key={`asset-${asset.id}`}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setSelectedAssetId(
                      selectedAssetId === asset.id ? null : asset.id
                    )
                  }
                >
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.quantity}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        ASSET_STATUS_BADGE_MAP[
                          asset.status as keyof typeof ASSET_STATUS_BADGE_MAP
                        ]?.color ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </TableCell>
                </TableRow>
                {selectedAssetId === asset.id && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-medium mb-2">Individual Items</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Serial Number</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-center">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {asset.items.map((item, index) => (
                              <TableRow key={`item-${item.id}-${index}`}>
                                <TableCell>{item.serial_number}</TableCell>
                                <TableCell>{item.location_name}</TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                      ASSET_STATUS_BADGE_MAP[
                                        item.status as keyof typeof ASSET_STATUS_BADGE_MAP
                                      ]?.color ||
                                      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </TableCell>
                                <TableCell className="flex gap-2 justify-center">
                                  <Button variant="outline" size="sm">
                                    <UserPlus className="h-4 w-4" />
                                    Assign
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Dialog
                                    open={
                                      isTransferDialogOpen &&
                                      selectedAssetId === asset.id
                                    }
                                    onOpenChange={setIsTransferDialogOpen}
                                  >
                                    <DialogTrigger asChild>
                                      <Button size="sm">
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Transfer
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Transfer Asset
                                        </DialogTitle>
                                      </DialogHeader>
                                      <Form {...form}>
                                        <form
                                          onSubmit={form.handleSubmit(onSubmit)}
                                          className="space-y-4"
                                        >
                                          <FormItem>
                                            <FormLabel>
                                              Current Location
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                value={item.location_name}
                                                readOnly
                                                disabled
                                                className="bg-muted"
                                              />
                                            </FormControl>
                                          </FormItem>
                                          <FormField
                                            control={form.control}
                                            name="locationId"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>
                                                  New Location
                                                </FormLabel>
                                                <Select
                                                  onValueChange={field.onChange}
                                                  defaultValue={field.value?.toString()}
                                                >
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select a location" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    {locations.map(
                                                      (location) => (
                                                        <SelectItem
                                                          key={location.id}
                                                          value={location.id.toString()}
                                                        >
                                                          {location.name}
                                                        </SelectItem>
                                                      )
                                                    )}
                                                  </SelectContent>
                                                </Select>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={transferAsset.isPending}
                                          >
                                            {transferAsset.isPending
                                              ? "Transferring..."
                                              : "Transfer"}
                                          </Button>
                                        </form>
                                      </Form>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
