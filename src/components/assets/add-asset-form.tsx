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

import { categoriesQueryOptions } from "@/queries/categories";
import { locationQueryOptions } from "@/queries/locations";
import { vendorsQueryOptions } from "@/queries/vendors";
import useAuthStore from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
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
  serialNumberPrefix: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  description: z.string().optional(),
  generateSerialNumbers: z.boolean().default(false),
});

type FormSchema = z.infer<typeof formSchema>;

interface AddAssetFormProps {
  onSuccess: () => void;
}

export function AddAssetForm({ onSuccess }: AddAssetFormProps) {
  const queryClient = useQueryClient();
  const [isGeneratingSerials, setIsGeneratingSerials] = useState(false);
  const { user } = useAuthStore();
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const { data: locations } = useSuspenseQuery(locationQueryOptions);
  const { data: vendors } = useSuspenseQuery(vendorsQueryOptions);

  // Check if user is branch admin
  const isBranchAdmin = user?.role === 'branch_admin';
  
  // Filter locations based on user role
  const availableLocations = isBranchAdmin && user?.branch 
    ? locations.filter(location => location.id === user.branch.toString())
    : locations;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      category: undefined,
      location: undefined,
      price: 0,
      vendor: undefined,
      serialNumberPrefix: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyExpiryDate: "",
      description: "",
      generateSerialNumbers: false,
    },
  });

  // Set default location for branch admin users
  useEffect(() => {
    if (isBranchAdmin && user?.branch) {
      form.setValue('location', user.branch);
    }
  }, [isBranchAdmin, user?.branch, form]);

  // Watch for form changes to debug
  const watchedLocation = form.watch('location');
  console.log('Current form location value:', watchedLocation);
  console.log('Is branch admin:', isBranchAdmin);
  console.log('User branch:', user?.branch);
  console.log('Available locations:', availableLocations);

  const mutation = useMutation({
    mutationFn: async (values: FormSchema) => {
      // Prepare the payload
      const payload = {
        name: values.name,
        quantity: Number(values.quantity),
        category: Number(values.category),
        location: Number(values.location),
        price: Number(values.price),
        vendor: Number(values.vendor),
        purchase_date: values.purchaseDate || null,
        warranty_expiry_date: values.warrantyExpiryDate || null,
        description: values.description || "",
        // Serial number generation options
        generate_serial_numbers: Boolean(values.generateSerialNumbers),
        serial_number_prefix:
          values.serialNumberPrefix ||
          values.name.substring(0, 3).toUpperCase(),
      };

      console.log("Sending asset data:", payload);

      try {
        const response = await axios.post("/assets/receive/", payload);
        console.log("API Response:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("API Error Details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url,
          method: error.config?.method,
          payload: payload
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-items"] });
      toast.success("Asset received successfully");
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          "Failed to receive asset";
      toast.error(errorMessage);
      console.error("Mutation Error:", error);
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
                <Select 
                  onValueChange={(value) => {
                    console.log('Location change attempted:', value, 'Is disabled:', isBranchAdmin);
                    if (!isBranchAdmin) {
                      field.onChange(value);
                    }
                  }}
                  disabled={isBranchAdmin}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isBranchAdmin && (
                  <p className="text-xs text-muted-foreground">
                    Location is automatically set to your branch
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Purchase Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter additional description"
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
