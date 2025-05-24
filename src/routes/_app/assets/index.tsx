import { AddAssetForm } from "@/components/assets/add-asset-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assetItemsQueryOptions } from "@/queries/assetsItems";
import { categoriesStatsQueryOptions } from "@/queries/categories";
import { locationQueryOptions } from "@/queries/locations";
import { vendorsQueryOptions } from "@/queries/vendors";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Package,
  PlusCircle,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { z } from "zod";

interface AssetFilters {
  status: string;
  category: string;
  location: string;
  vendor: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/_app/assets/")({
  validateSearch: z.object({
    addAsset: z.string().optional().catch(""),
    view: z.enum(["table", "cards"]).optional().catch("table"),
    page: z.number().optional().catch(1),
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(categoriesStatsQueryOptions);
    queryClient.ensureQueryData(assetItemsQueryOptions);
    queryClient.ensureQueryData(locationQueryOptions);
    queryClient.ensureQueryData(vendorsQueryOptions);
  },
  component: AssetsRoute,
});

function AssetsRoute() {
  const navigate = Route.useNavigate();
  const { addAsset, view = "table", page = 1 } = Route.useSearch();
  
  // Data queries
  const { data: categories = [] } = useSuspenseQuery(categoriesStatsQueryOptions);
  const { data: assetItems = [] } = useSuspenseQuery(assetItemsQueryOptions);
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);
  const { data: vendors = [] } = useSuspenseQuery(vendorsQueryOptions);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!addAsset);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>("asset_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const [filters, setFilters] = useState<AssetFilters>({
    status: "all",
    category: "all",
    location: "all",
    vendor: "all",
  });

  // Filtered and sorted data
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assetItems.filter((asset) => {
      const matchesSearch = searchQuery === "" || 
        asset.asset_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filters.status === "all" || asset.status === filters.status;
      const matchesLocation = filters.location === "all" || asset.locationId.toString() === filters.location;
      const matchesVendor = filters.vendor === "all" || asset.vendorId.toString() === filters.vendor;
      const matchesCategory = filters.category === "all" || asset.assetId.toString() === filters.category;
      
      return matchesSearch && matchesStatus && matchesLocation && matchesVendor && matchesCategory;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof typeof a] as any;
      let bValue = b[sortField as keyof typeof b] as any;
      
      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assetItems, searchQuery, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAssets.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = filteredAndSortedAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAsset = (assetId: number) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === paginatedAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(paginatedAssets.map(asset => asset.id)));
    }
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { ...Route.useSearch(), page: newPage } });
  };

  const handleViewChange = (newView: "table" | "cards") => {
    navigate({ search: { ...Route.useSearch(), view: newView, page: 1 } });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    navigate({ search: { addAsset: undefined } });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { 
        variant: "default" as const, 
        color: "text-green-700", 
        bg: "bg-green-50 border-green-200",
        label: "Available"
      },
      ASSIGNED: { 
        variant: "secondary" as const, 
        color: "text-blue-700", 
        bg: "bg-blue-50 border-blue-200",
        label: "Assigned"
      },
      MAINTENANCE: { 
        variant: "outline" as const, 
        color: "text-orange-700", 
        bg: "bg-orange-50 border-orange-200",
        label: "Maintenance"
      },
      BROKEN: { 
        variant: "destructive" as const, 
        color: "text-red-700", 
        bg: "bg-red-50 border-red-200",
        label: "Broken"
      },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
  };

  // Statistics for summary
  const assetStats = useMemo(() => {
    const total = assetItems.length;
    const available = assetItems.filter(item => item.status === 'AVAILABLE').length;
    const assigned = assetItems.filter(item => item.status === 'ASSIGNED').length;
    const maintenance = assetItems.filter(item => item.status === 'MAINTENANCE').length;
    const broken = assetItems.filter(item => item.status === 'BROKEN').length;

    return { total, available, assigned, maintenance, broken };
  }, [assetItems]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
          <p className="text-muted-foreground">
            Manage and track all your assets ({filteredAndSortedAssets.length} of {assetItems.length} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(value) => handleViewChange(value as "table" | "cards")}>
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-1">
                <Grid3X3 className="h-4 w-4" />
                Cards
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Asset Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{assetStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{assetStats.available}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{assetStats.assigned}</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{assetStats.maintenance}</div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{assetStats.broken}</div>
              <div className="text-sm text-muted-foreground">Broken</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="BROKEN">Broken</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.location}
              onValueChange={(value) => setFilters({ ...filters, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.vendor}
              onValueChange={(value) => setFilters({ ...filters, vendor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ status: "all", category: "all", location: "all", vendor: "all" })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAssets.size > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {selectedAssets.size} asset(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsIssueDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
                Issue Assets
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Bulk status update functionality could be added here
                  console.log('Bulk update status for:', Array.from(selectedAssets));
                }}
              >
                Update Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAssets(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {view === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAssets.size === paginatedAssets.length && paginatedAssets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("asset_name")}>
                      <div className="flex items-center gap-1">
                        Asset Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAssets.has(asset.id)}
                            onCheckedChange={() => handleSelectAsset(asset.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{asset.asset_name}</TableCell>
                        <TableCell className="font-mono text-sm">{asset.serial_number}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(asset.status).variant}
                            className={`${getStatusBadge(asset.status).bg} ${getStatusBadge(asset.status).color}`}
                          >
                            {getStatusBadge(asset.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.location_name}</TableCell>
                        <TableCell>${asset.price?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>
                          {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No assets found</p>
                        <p className="text-sm text-muted-foreground/70">
                          {filteredAndSortedAssets.length < assetItems.length 
                            ? "Try adjusting your filters" 
                            : "Start by adding your first asset"}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards View */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedAssets.length > 0 ? (
            paginatedAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedAssets.has(asset.id)}
                        onCheckedChange={() => handleSelectAsset(asset.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">{asset.asset_name}</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">
                          {asset.serial_number}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={getStatusBadge(asset.status).variant}
                      className={`${getStatusBadge(asset.status).bg} ${getStatusBadge(asset.status).color}`}
                    >
                      {getStatusBadge(asset.status).label}
                    </Badge>
                    <span className="text-sm font-semibold">
                      ${asset.price?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span>{asset.location_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span>
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No assets found</h3>
              <p className="text-sm text-muted-foreground/70 mb-4">
                {filteredAndSortedAssets.length < assetItems.length 
                  ? "Try adjusting your filters or search term" 
                  : "Start by adding your first asset"}
              </p>
              {filteredAndSortedAssets.length >= assetItems.length && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add First Asset
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedAssets.length)} of {filteredAndSortedAssets.length} assets
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Asset Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <AddAssetForm onSuccess={handleCloseModal} />
        </DialogContent>
      </Dialog>

      {/* Issue Assets Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Selected Assets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Selected Assets ({selectedAssets.size}):
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {paginatedAssets
                  .filter(asset => selectedAssets.has(asset.id))
                  .map(asset => (
                    <div key={asset.id} className="text-sm">
                      {asset.asset_name} ({asset.serial_number})
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Issue Type</label>
                <Select defaultValue="assign">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign">Assign to User</SelectItem>
                    <SelectItem value="transfer">Transfer to Location</SelectItem>
                    <SelectItem value="maintenance">Send to Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Destination</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Input placeholder="Add notes for this transaction..." />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1"
                onClick={() => {
                  // Handle asset issuance
                  console.log('Issuing assets:', Array.from(selectedAssets));
                  setIsIssueDialogOpen(false);
                  setSelectedAssets(new Set());
                }}
              >
                Issue Assets
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsIssueDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
