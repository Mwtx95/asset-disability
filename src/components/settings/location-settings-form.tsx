import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Location } from '@/queries/locations';
import {
  locationQueryOptions,
  useCreateLocation,
  useUpdateLocation,
} from '@/queries/locations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';

const locationFormSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  type: z.enum(['building', 'floor', 'room', 'area']),
  parentLocation: z.string().optional(),
  description: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

interface LocationSettingsFormProps {
  setIsOpen: (value: boolean) => void;
  editingLocation?: Location | null;
}

export function LocationSettingsForm({
  setIsOpen,
  editingLocation,
}: LocationSettingsFormProps) {
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: editingLocation
      ? {
          name: editingLocation.name,
          type: editingLocation.type,
          parentLocation: editingLocation.parentLocation || undefined,
          description: editingLocation.description || undefined,
        }
      : undefined,
  });

  async function onSubmit(data: LocationFormValues) {
    try {
      if (editingLocation) {
        await updateLocation.mutateAsync({
          ...data,
          id: editingLocation.id,
        });
      } else {
        await createLocation.mutateAsync(data);
      }
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid gap-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Location Name'
                    {...field}
                    aria-describedby='location-name-description'
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  aria-describedby='location-type-description'
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select location type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='building'>Building</SelectItem>
                    <SelectItem value='floor'>Floor</SelectItem>
                    <SelectItem value='room'>Room</SelectItem>
                    <SelectItem value='area'>Area</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='parentLocation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  aria-describedby='parent-location-description'
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Parent Location (Optional)' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations
                      .filter(l => l.name !== editingLocation?.name)
                      .map(location => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Description (Optional)'
                    className='h-20'
                    {...field}
                    aria-describedby='location-description-description'
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full'>
            {editingLocation ? 'Update Location' : 'Add Location'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
