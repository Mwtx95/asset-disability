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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ASSET_STATUSES } from "@/lib/constants";
import { categoriesQueryOptions } from "@/queries/categories";
import { locationQueryOptions } from "@/queries/locations";
import { vendorsQueryOptions } from "@/queries/vendors";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  quantity: z.coerce
    .number()
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity must be less than 1000"),
  category: z.coerce.number().min(1, "Please select a category"),
  location: z.coerce.number().min(1, "Please select a location"),
  price: z.coerce.number().min(0, "Price must be at least 0").default(0),
  vendor: z.coerce.number().min(1, "Please select a vendor"),
  status: z.string().min(1, "Please select a status"),
  serialNumberPrefix: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  notes: z.string().optional(),
  generateSerialNumbers: z.boolean().default(false),
});

type FormSchema = z.infer<typeof formSchema>;

interface AddAssetFormProps {
  onSuccess: () => void;
}

export function AddAssetForm({ onSuccess }: AddAssetFormProps) {
  const queryClient = useQueryClient();
  const [isGeneratingSerials, setIsGeneratingSerials] = useState(false);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: locations } = useSuspenseQuery(locationQueryOptions);
  const { data: vendors } = useSuspenseQuery(vendorsQueryOptions);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      category: undefined,
      location: undefined,
      price: 0,
      vendor: undefined,
      status: ASSET_STATUSES.AVAILABLE,
      serialNumberPrefix: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyExpiryDate: "",
      notes: "",
      generateSerialNumbers: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormSchema) => {
      // First create the asset
      console.log("Sending asset data:", {
        name: values.name,
        quantity: values.quantity,
        category: values.category,
        location: values.location,
        price: values.price,
        vendor: values.vendor,
        status: values.status,
        purchase_date: values.purchaseDate, // Changed field name to match Django model
        warranty_expiry_date: values.warrantyExpiryDate, // Changed field name to match Django model
        notes: values.notes,
      });

      const response = await axios.post("/assets/receive/", {
        name: values.name,
        quantity: values.quantity,
        category: values.category,
        location: values.location,
        price: values.price,
        vendor: values.vendor,
        status: values.status,
        purchase_date: values.purchaseDate, // Changed field name to match Django model
        warranty_expiry_date: values.warrantyExpiryDate, // Changed field name to match Django model
        notes: values.notes,
      });

      console.log("Full API response:", response);

      // Check the structure of the response
      const assetData = response.data;
      console.log("Asset data received:", assetData);

      // Check if we got an ID and where it might be located
      let assetId = null;
      if (assetData && assetData.id) {
        assetId = assetData.id;
        console.log("Asset ID found in data.id:", assetId);
      } else if (assetData && assetData.asset && assetData.asset.id) {
        assetId = assetData.asset.id;
        console.log("Asset ID found in data.asset.id:", assetId);
      } else if (assetData && typeof assetData === "object") {
        // Look for an ID field if the response is an object
        const possibleIdFields = Object.entries(assetData).find(
          ([key]) => key.toLowerCase().includes("id") || key === "pk"
        );

        if (possibleIdFields) {
          assetId = possibleIdFields[1];
          console.log(`Asset ID found in ${possibleIdFields[0]}:`, assetId);
        } else {
          console.log("Response keys:", Object.keys(assetData));
        }
      }

      // Generate serial numbers if needed
      const serialNumbers: string[] = [];
      if (values.generateSerialNumbers) {
        const prefix =
          values.serialNumberPrefix ||
          values.name.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);

        for (let i = 0; i < values.quantity; i++) {
          // Format: PREFIX-TIMESTAMP-INDEX (e.g. LAP-123456-001)
          const index = (i + 1).toString().padStart(3, "0");
          serialNumbers.push(`${prefix}-${timestamp}-${index}`);
        }
      }

      // IMPORTANT: Based on your Django code, it seems the /assets/receive/ endpoint
      // already creates asset items when you send quantity > 1.
      // We should NOT create additional asset items here to avoid duplication.

      console.log(
        "Asset creation complete. Returning asset data without creating additional items."
      );
      // Just return the asset data without creating additional items
      return assetData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-items"] });
      toast.success("Asset received successfully");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to receive asset");
      console.error(error);
    },
  });

  function onSubmit(values: FormSchema) {
    mutation.mutate(values);
  }

  // Toggle serial number generation
  const toggleSerialNumberGeneration = (enabled: boolean) => {
    setIsGeneratingSerials(enabled);
    form.setValue("generateSerialNumbers", enabled);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter asset name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange}>
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Purchase Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
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
                <Select onValueChange={field.onChange}>
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
                    {Object.entries(ASSET_STATUSES)
                      .filter(([key]) => key !== "ALL") // Filter out the "All Statuses" option
                      .map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Select purchase date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warrantyExpiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty Expiry Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Select warranty expiry date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Serial Numbers */}
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">Serial Number Options</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="generateSerialNumbers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Auto-generate Serial Numbers
                    </FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        toggleSerialNumberGeneration(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isGeneratingSerials && (
              <FormField
                control={form.control}
                name="serialNumberPrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number Prefix</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter prefix (e.g. LAP for laptop)"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-xs mt-1">
                      Serial numbers will be generated in the format:
                      PREFIX-TIMESTAMP-INDEX
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter additional notes"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Receiving..." : "Receive Asset"}
        </Button>
      </form>
    </Form>
  );
}
