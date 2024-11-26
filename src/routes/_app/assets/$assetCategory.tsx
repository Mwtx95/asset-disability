import { AddAssetItemForm } from '@/components/assets/add-asset-item-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ASSET_STATUS_BADGE_MAP } from '@/lib/constants'
import { assetsQueryOptions, useTransferAssetMutation } from '@/queries/assets'
import { assetItemsByCategoryIdQueryOptions, assetItemsQueryOptions } from '@/queries/assetsItems'
import { locationQueryOptions } from '@/queries/locations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRightLeft, Pencil, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const transferFormSchema = z.object({
  locationId: z.coerce.number().min(1, 'Please select a location'),
})

type TransferFormValues = z.infer<typeof transferFormSchema>

export const Route = createFileRoute('/_app/assets/$assetCategory')({
  loader: ({ context: { queryClient }, params: { assetCategory } }) => {
    const [categoryId] = assetCategory.split('_')
    queryClient.ensureQueryData(assetItemsByCategoryIdQueryOptions(parseInt(categoryId)))
  },
  component: AssetDetailsRoute,
})

function AssetDetailsRoute() {
  const { assetCategory } = Route.useParams()
  const [categoryId, categoryName] = assetCategory.split('_')
  const { data: categoryAssets } = useSuspenseQuery(
    assetItemsByCategoryIdQueryOptions(parseInt(categoryId))
  )
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions)
  const transferAsset = useTransferAssetMutation()
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
  })

  async function onSubmit(values: TransferFormValues) {
    try {
      await transferAsset.mutateAsync({
        assetId: categoryAssets[0].id.toString(),
        locationId: values.locationId,
      })
      setIsTransferDialogOpen(false)
      form.setValue('locationId', undefined as any)
    } catch (error) {
      console.error('Failed to transfer asset:', error)
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
          <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
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
              <TableHead className="min-w-[120px]">Location</TableHead>
              <TableHead className="min-w-[150px]">Assigned To</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="text-center min-w-[160px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryAssets?.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.assetName}</TableCell>
                <TableCell>{asset.locationName}</TableCell>
                <TableCell className="text-center">
                  {/* {asset.} */}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${ASSET_STATUS_BADGE_MAP[
                      asset.status as keyof typeof ASSET_STATUS_BADGE_MAP
                    ]?.color ||
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                  >
                    {asset.status}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2 justify-center">
                  <Button variant="secondary" size="sm">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                  <Dialog
                    open={isTransferDialogOpen}
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
                        <DialogTitle>Transfer Asset</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-4"
                        >
                          <FormItem>
                            <FormLabel>Current Location</FormLabel>
                            <FormControl>
                              <Input
                                value={asset.locationName}
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
                                <FormLabel>New Location</FormLabel>
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
                                    {locations
                                      .filter(
                                        (location) =>
                                          location.name !== asset.locationName,
                                      )
                                      .map((location) => (
                                        <SelectItem
                                          key={location.id}
                                          value={location.id.toString()}
                                        >
                                          {location.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={transferAsset.isPending}
                          >
                            {transferAsset.isPending
                              ? 'Transferring...'
                              : 'Transfer Asset'}
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
    </div>
  )
}
