import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Download,
  FileText,
  Filter,
  Search,
  Calendar,
  MapPin,
  Package,
  Building2,
  FileSpreadsheet,
  FileDown,
  Eye,
  BarChart3,
} from 'lucide-react'
import { assetsQueryOptions, type Asset } from '@/queries/assets'
import { assetItemsQueryOptions, type AssetItem } from '@/queries/assetsItems'
import { categoriesStatsQueryOptions } from '@/queries/categories'
import { locationQueryOptions } from '@/queries/locations'
import { vendorsQueryOptions } from '@/queries/vendors'
import { format } from 'date-fns'

export const Route = createFileRoute('/_app/reports')({
  component: RouteComponent,
})

interface FilterState {
  reportType: 'assets' | 'assetItemReport' | ''
  dateRange: { from?: Date; to?: Date }
  category: string
  location: string
  vendor: string
  status: string
  format: 'pdf' | 'excel' | 'csv' | 'json' | ''
  assetFilter: string // Filter for asset selection in asset item reports
}

function RouteComponent() {
  const [filters, setFilters] = React.useState<FilterState>({
    reportType: '', // Start with empty to show placeholder
    dateRange: {},
    category: '', // Start with empty to show placeholder
    location: '', // Start with empty to show placeholder
    vendor: '', // Start with empty to show placeholder
    status: '', // Start with empty to show placeholder
    format: '', // Start with empty to show placeholder
    assetFilter: '', // Start with empty to show placeholder
  })

  const [isGenerating, setIsGenerating] = React.useState(false)
  const [previewData, setPreviewData] = React.useState<(Asset | AssetItem)[]>([])

  // Fetch all required data
  const { data: assets } = useSuspenseQuery(assetsQueryOptions)
  const { data: assetItems } = useSuspenseQuery(assetItemsQueryOptions)
  const { data: categories } = useSuspenseQuery(categoriesStatsQueryOptions)
  const { data: locations } = useSuspenseQuery(locationQueryOptions)
  const { data: vendors } = useSuspenseQuery(vendorsQueryOptions)

  // Filter data based on current filters
  const filteredData = React.useMemo(() => {
    // Return empty array if no report type is selected
    if (!filters.reportType) return []
    
    let data: (Asset | AssetItem)[] = 
      filters.reportType === 'assetItemReport' ? (assetItems || []) : (assets || [])

    // Apply asset filter (only for asset item reports)
    if (filters.assetFilter && filters.assetFilter !== 'all' && filters.reportType === 'assetItemReport') {
      data = data.filter((item) => {
        if ('asset' in item && typeof item.asset === 'number') {
          return item.asset.toString() === filters.assetFilter
        }
        if ('asset_name' in item && typeof item.asset_name === 'string') {
          return item.asset_name === filters.assetFilter
        }
        return false
      })
    }

    if (filters.category && filters.category !== 'all') {
      data = data.filter((item) => {
        try {
          if (filters.reportType === 'assetItemReport') {
            // For asset items, we need to find the related asset and check its category
            // Asset items have an 'asset' field that references the asset ID
            if ('asset' in item && typeof item.asset === 'number') {
              const relatedAsset = assets?.find(a => a.id === item.asset)
              if (relatedAsset) {
                // Use comprehensive category matching like in assets page
                const assetAny = relatedAsset as any;
                const category = categories?.find(c => 
                  c.name === relatedAsset.categoryName ||
                  c.id === assetAny.categoryId || 
                  c.id === Number(assetAny.category) || 
                  c.id.toString() === assetAny.category ||
                  c.name === assetAny.category
                );
                return category?.name === filters.category
              }
            }
            // Fallback: check if asset_details exists and has categoryName
            if ('asset_details' in item && item.asset_details?.categoryName) {
              return item.asset_details.categoryName === filters.category
            }
            return false
          } else {
            // For assets, use comprehensive category matching
            const assetAny = item as any;
            const category = categories?.find(c => 
              c.name === (item as any).categoryName ||
              c.id === assetAny.categoryId || 
              c.id === Number(assetAny.category) || 
              c.id.toString() === assetAny.category ||
              c.name === assetAny.category
            );
            return category?.name === filters.category
          }
        } catch (error) {
          return false
        }
      })
    }

    if (filters.location && filters.location !== 'all') {
      data = data.filter((item) => {
        if (filters.reportType === 'assetItemReport') {
          // For asset items, check location (number) or location_name
          if ('location' in item && typeof item.location === 'number') {
            return item.location.toString() === filters.location
          }
          if ('location_name' in item && typeof item.location_name === 'string') {
            return item.location_name === filters.location
          }
          return false
        } else {
          // For assets, check location field
          if ('location' in item && typeof item.location === 'number') {
            return item.location.toString() === filters.location
          }
          if ('currentLocation' in item) {
            return item.currentLocation === filters.location
          }
          if ('location' in item && typeof item.location === 'string') {
            return item.location === filters.location
          }
          return false
        }
      })
    }

    if (filters.vendor && filters.vendor !== 'all') {
      data = data.filter((item) => {
        if (filters.reportType === 'assetItemReport') {
          // For asset items, check vendor (number) or vendor_name
          if ('vendor' in item && typeof item.vendor === 'number') {
            return item.vendor.toString() === filters.vendor
          }
          if ('vendor_name' in item && typeof item.vendor_name === 'string') {
            return item.vendor_name === filters.vendor
          }
          return false
        } else {
          // For assets, check vendor fields
          if ('vendor' in item && typeof item.vendor === 'number') {
            return item.vendor.toString() === filters.vendor
          }
          if ('vendorId' in item) {
            return item.vendorId?.toString() === filters.vendor
          }
          return false
        }
      })
    }

    if (filters.status && filters.status !== 'all' && filters.reportType === 'assetItemReport') {
      data = data.filter((item) => {
        if ('status' in item) {
          return item.status === filters.status
        }
        return false
      })
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      data = data.filter((item) => {
        let itemDate: Date
        if (filters.reportType === 'assetItemReport') {
          // For asset items, prioritize purchase_date, then created_at
          if ('purchase_date' in item && item.purchase_date) {
            itemDate = new Date(item.purchase_date)
          } else if ('created_at' in item && item.created_at) {
            itemDate = new Date(item.created_at)
          } else {
            return false
          }
        } else {
          // For assets, check purchase_date, purchaseDate, then createdAt
          if ('purchase_date' in item && item.purchase_date) {
            itemDate = new Date(item.purchase_date)
          } else if ('purchaseDate' in item && item.purchaseDate) {
            itemDate = new Date(item.purchaseDate)
          } else if ('createdAt' in item) {
            itemDate = new Date(item.createdAt)
          } else {
            return false
          }
        }
        
        if (filters.dateRange.from && itemDate < filters.dateRange.from) return false
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false
        return true
      })
    }

    return data
  }, [assets, assetItems, filters])

  // Update preview when filtered data changes
  React.useEffect(() => {
    setPreviewData(filteredData.slice(0, 20)) // Show first 20 items for preview to show more rows per page
  }, [filteredData])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would call your backend API here
      const reportData = {
        type: filters.reportType,
        data: filteredData,
        filters: filters,
        generatedAt: new Date().toISOString(),
        totalRecords: filteredData.length
      }

      // Generate download based on format
      switch (filters.format) {
        case 'json':
          downloadJSON(reportData)
          break
        case 'csv':
          downloadCSV(filteredData)
          break
        case 'excel':
          // In real implementation, use a library like xlsx
          alert('Excel export would be implemented with xlsx library')
          break
        case 'pdf':
          // In real implementation, use a library like jsPDF
          alert('PDF export would be implemented with jsPDF library')
          break
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filters.reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = (data: (Asset | AssetItem)[]) => {
    if (data.length === 0) return

    // Create headers based on report type
    let headers: string[]
    let csvContent: string

    if (filters.reportType === 'assetItemReport') {
      headers = ['Asset Name', 'Serial Number', 'Status', 'Location', 'Purchase Date', 'Price']
      csvContent = [
        headers.join(','),
        ...data.map(item => {
          const assetItem = item as AssetItem
          return [
            `"${assetItem.asset_name || ''}"`,
            `"${assetItem.serial_number || ''}"`,
            `"${assetItem.status || ''}"`,
            `"${assetItem.location_name || ''}"`,
            `"${assetItem.purchase_date || ''}"`,
            `"${assetItem.price || ''}"`
          ].join(',')
        })
      ].join('\n')
    } else if (filters.reportType === 'assets') {
      headers = ['Asset Name', 'Category', 'Location', 'Quantity', 'Price per Unit', 'Total Value', 'Vendor', 'Purchase Date', 'Warranty Date']
      csvContent = [
        headers.join(','),
        ...data.map(item => {
          const asset = item as Asset
          const quantity = 'quantity' in asset ? (asset.quantity || 1) : 1
          const price = Number('price' in asset ? (asset.price || 0) : 'purchase_price' in asset ? (asset.purchase_price || 0) : 0)
          const totalValue = quantity * price
          return [
            `"${asset.name || ''}"`,
            `"${getCategoryName(asset.categoryName, undefined, asset)}"`,
            `"${getLocationName(asset.location)}"`,
            `"${quantity}"`,
            `"${price}"`,
            `"${totalValue}"`,
            `"${getVendorName(asset.vendor, asset.vendorId)}"`,
            `"${'purchase_date' in asset ? asset.purchase_date : asset.createdAt || ''}"`,
            `"${'warranty_date' in asset && asset.warranty_date ? asset.warranty_date : 'N/A'}"`
          ].join(',')
        })
      ].join('\n')
    } else {
      headers = ['Name', 'Description', 'Category', 'Location', 'Vendor', 'Created At']
      csvContent = [
        headers.join(','),
        ...data.map(item => {
          const asset = item as Asset
          return [
            `"${asset.name || ''}"`,
            `"${asset.description || ''}"`,
            `"${getCategoryName(asset.categoryName, undefined, asset)}"`,
            `"${getLocationName(asset.location)}"`,
            `"${getVendorName(asset.vendor, asset.vendorId)}"`,
            `"${asset.createdAt || ''}"`
          ].join(',')
        })
      ].join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filters.reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      case 'BROKEN': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLocationName = (locationValue: any) => {
    if (!locationValue) return 'N/A'
    
    // If it's already a string (name), return it
    if (typeof locationValue === 'string') return locationValue
    
    // If it's a number (ID), look up the name
    if (typeof locationValue === 'number') {
      const location = locations?.find((loc: any) => loc.id === locationValue)
      return location?.name || 'N/A'
    }
    
    return 'N/A'
  }

  const getVendorName = (vendorValue: any, vendorId?: any) => {
    // Check vendorId first (if provided)
    if (vendorId) {
      const vendor = vendors?.find((v: any) => v.id === vendorId)
      if (vendor) return vendor.name
    }
    
    if (!vendorValue) return 'N/A'
    
    // If it's already a string (name), return it
    if (typeof vendorValue === 'string') return vendorValue
    
    // If it's a number (ID), look up the name
    if (typeof vendorValue === 'number') {
      const vendor = vendors?.find((v: any) => v.id === vendorValue)
      return vendor?.name || 'N/A'
    }
    
    return 'N/A'
  }

  const getCategoryName = (categoryValue: any, categoryId?: any, asset?: any) => {
    // Check categoryId first (if provided)
    if (categoryId) {
      const category = categories?.find((c: any) => c.id === categoryId)
      if (category) return category.name
    }
    
    // Check for asset-specific category fields if asset is provided
    if (asset) {
      // Try multiple possible category field names
      const assetAny = asset as any
      const category = categories?.find((c: any) => 
        c.name === asset.categoryName ||
        c.id === assetAny.categoryId || 
        c.id === Number(assetAny.category) || 
        c.id.toString() === assetAny.category ||
        c.name === assetAny.category
      )
      if (category) return category.name
    }
    
    if (!categoryValue) return 'N/A'
    
    // If it's already a string (name), return it
    if (typeof categoryValue === 'string') return categoryValue
    
    // If it's a number (ID), look up the name
    if (typeof categoryValue === 'number') {
      const category = categories?.find((c: any) => c.id === categoryValue)
      return category?.name || 'N/A'
    }
    
    return 'N/A'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive reports for your assets and asset items
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            {filteredData.length} Records
          </Badge>
        </div>
      </div>

      {/* Filters - Clean Horizontal Layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {/* Report Type */}
        <Select
          value={filters.reportType}
          onValueChange={(value: 'assets' | 'assetItemReport') => 
            handleFilterChange('reportType', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assets">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Assets</span>
              </div>
            </SelectItem>
            <SelectItem value="assetItemReport">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Asset Item</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Asset Filter (only for Asset Item Reports) */}
        {filters.reportType === 'assetItemReport' && (
          <Select
            value={filters.assetFilter}
            onValueChange={(value) => handleFilterChange('assetFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {assets?.map((asset: any) => (
                <SelectItem key={asset.id} value={asset.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>{asset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select
          value={filters.location}
          onValueChange={(value) => handleFilterChange('location', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations?.map((location: any) => (
              <SelectItem key={location.id} value={location.id.toString()}>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{location.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Vendor Filter */}
        <Select
          value={filters.vendor}
          onValueChange={(value) => handleFilterChange('vendor', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors?.map((vendor: any) => (
              <SelectItem key={vendor.id} value={vendor.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{vendor.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter (only for asset item reports) */}
        {filters.reportType === 'assetItemReport' && (
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="BROKEN">Broken</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Export Format */}
        <Select
          value={filters.format}
          onValueChange={(value: 'pdf' | 'excel' | 'csv' | 'json') => 
            handleFilterChange('format', value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Export format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </div>
            </SelectItem>
            <SelectItem value="excel">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </div>
            </SelectItem>
            <SelectItem value="csv">
              <div className="flex items-center space-x-2">
                <FileDown className="h-4 w-4" />
                <span>CSV</span>
              </div>
            </SelectItem>
            <SelectItem value="json">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>JSON</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range and Generate Button Row */}
      <div className="flex items-center justify-between gap-4">
        <DateRangePicker
          from={filters.dateRange.from}
          to={filters.dateRange.to}
          onRangeChange={(range) => handleFilterChange('dateRange', range)}
          placeholder="Select date range"
        />
        
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating || filteredData.length === 0 || !filters.reportType || !filters.format}
          size="lg"
          className="px-8"
        >
          {isGenerating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Asset Summary Section (only for Asset Item Reports with specific asset filter) */}
      {filters.reportType === 'assetItemReport' && filters.assetFilter && filters.assetFilter !== 'all' && filters.assetFilter !== '' && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Package className="h-5 w-5" />
              <span>Asset Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedAsset = assets?.find((asset: any) => asset.id.toString() === filters.assetFilter);
              if (!selectedAsset) return <p className="text-sm text-muted-foreground">Asset not found</p>;
              
              const quantity = 'quantity' in selectedAsset ? (selectedAsset.quantity || 1) : 1;
              const price = Number('purchasePrice' in selectedAsset ? (selectedAsset.purchasePrice || 0) : 
                           'price' in selectedAsset ? (selectedAsset.price || 0) : 0);
              const totalValue = quantity * price;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Asset Name</Label>
                    <p className="font-semibold">{selectedAsset.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                    <p className="font-medium">{selectedAsset.categoryName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                    <p className="font-medium">{getLocationName(selectedAsset.location)}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Vendor</Label>
                    <p className="font-medium">{getVendorName(selectedAsset.vendor, selectedAsset.vendorId)}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                    <p className="font-medium">{quantity}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Price per Unit</Label>
                    <p className="font-medium">${price.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Total Value</Label>
                    <p className="font-semibold text-blue-700">${totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Asset Items</Label>
                    <p className="font-semibold text-green-700">{filteredData.length} items</p>
                  </div>
                  {selectedAsset.description && (
                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                      <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm">{selectedAsset.description}</p>
                    </div>
                  )}
                  {selectedAsset.purchaseDate && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Purchase Date</Label>
                      <p className="font-medium">{format(new Date(selectedAsset.purchaseDate), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                  {selectedAsset.warrantyExpiryDate && selectedAsset.warrantyExpiryDate.trim() !== '' && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Warranty Expiry</Label>
                      <p className="font-medium">{format(new Date(selectedAsset.warrantyExpiryDate), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Preview Table - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Data Preview</span>
            <Badge variant="secondary">{previewData.length} of {filteredData.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {filters.reportType === 'assetItemReport' ? (
                      <>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Price</TableHead>
                      </>
                    ) : filters.reportType === 'assets' ? (
                      <>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price per Unit</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty Date</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Created</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((item, index: number) => (
                    <TableRow key={index}>
                      {filters.reportType === 'assetItemReport' ? (
                        <>
                          <TableCell className="font-medium">
                            {'asset_name' in item ? item.asset_name : ''}
                          </TableCell>
                          <TableCell>
                            {'serial_number' in item ? item.serial_number : ''}
                          </TableCell>
                          <TableCell>
                            {'status' in item ? (
                              <Badge className={getStatusBadgeColor(item.status)}>
                                {item.status}
                              </Badge>
                            ) : ''}
                          </TableCell>
                          <TableCell>
                            {'location_name' in item ? item.location_name : ''}
                          </TableCell>
                          <TableCell>
                            {'purchase_date' in item ? format(new Date(item.purchase_date), 'MMM dd, yyyy') : ''}
                          </TableCell>
                          <TableCell>
                            {'price' in item ? `$${item.price?.toLocaleString()}` : ''}
                          </TableCell>
                        </>
                      ) : filters.reportType === 'assets' ? (
                        <>
                          <TableCell className="font-medium">{'name' in item ? item.name : ''}</TableCell>
                          <TableCell>{getCategoryName('categoryName' in item ? item.categoryName : '', undefined, item)}</TableCell>
                          <TableCell>{getLocationName('location' in item ? item.location : '')}</TableCell>
                          <TableCell>
                            {'quantity' in item ? item.quantity || 1 : 1}
                          </TableCell>
                          <TableCell>
                            {'price' in item ? `$${item.price?.toLocaleString() || '0'}` : 
                             'purchase_price' in item ? `$${item.purchase_price?.toLocaleString() || '0'}` : '$0'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {(() => {
                              const quantity = 'quantity' in item ? (item.quantity || 1) : 1;
                              const price = Number('price' in item ? (item.price || 0) : 
                                           'purchase_price' in item ? (item.purchase_price || 0) : 0);
                              const totalValue = quantity * price;
                              return `$${totalValue.toLocaleString()}`;
                            })()}
                          </TableCell>
                          <TableCell>{getVendorName('vendor' in item ? item.vendor : '', 'vendorId' in item ? item.vendorId : '')}</TableCell>
                          <TableCell>
                            {'purchase_date' in item ? format(new Date(item.purchase_date), 'MMM dd, yyyy') : 
                             'createdAt' in item ? format(new Date(item.createdAt), 'MMM dd, yyyy') : ''}
                          </TableCell>
                          <TableCell>
                            {'warranty_date' in item && item.warranty_date && 
                             typeof item.warranty_date === 'string' && item.warranty_date.trim() !== '' ? 
                              format(new Date(item.warranty_date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{'name' in item ? item.name : ''}</TableCell>
                          <TableCell>{'categoryName' in item ? item.categoryName : ''}</TableCell>
                          <TableCell>{'location' in item ? item.location : ''}</TableCell>
                          <TableCell>{'vendor' in item ? item.vendor || 'N/A' : 'N/A'}</TableCell>
                          <TableCell>
                            {'createdAt' in item ? format(new Date(item.createdAt), 'MMM dd, yyyy') : ''}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No data matches the current filters
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Try adjusting your filter criteria
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
