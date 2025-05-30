import { AddAssetForm } from "@/components/assets/add-asset-form";
import { EditAssetForm } from "@/components/assets/edit-asset-form";
import { EditAssetItemForm } from "@/components/assets/edit-asset-item-form";
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

import { assetsQueryOptions, Asset } from "@/queries/assets";
import { AssetItem, assetItemsByAssetIdQueryOptions, assetItemsQueryOptions } from "@/queries/assetsItems";
import { categoriesStatsQueryOptions } from "@/queries/categories";
import { locationQueryOptions } from "@/queries/locations";
import { vendorsQueryOptions } from "@/queries/vendors";
import useAuthStore from "@/stores/auth";
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  PlusCircle,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";

interface AssetFilters {
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
    page: z.number().optional().catch(1),
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(categoriesStatsQueryOptions);
    queryClient.ensureQueryData(assetsQueryOptions);
    queryClient.ensureQueryData(assetItemsQueryOptions);
    queryClient.ensureQueryData(locationQueryOptions);
    queryClient.ensureQueryData(vendorsQueryOptions);
  },
  component: AssetsRoute,
});

function AssetsRoute() {
  const navigate = Route.useNavigate();
  const { addAsset, page = 1 } = Route.useSearch();
  const queryClient = useQueryClient();
  
  // Data queries
  const { data: categories = [] } = useSuspenseQuery(categoriesStatsQueryOptions);
  const { data: assets = [] } = useSuspenseQuery(assetsQueryOptions);
  const { data: assetItems = [] } = useSuspenseQuery(assetItemsQueryOptions);
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);
  const { data: vendors = [] } = useSuspenseQuery(vendorsQueryOptions);

  // Auth store for location filtering
  const { user } = useAuthStore();
  const isBranchAdmin = user?.role === 'branch_admin';
  
  // Filter locations based on user role
  const availableLocations = useMemo(() => {
    if (isBranchAdmin && user?.branch) {
      return locations.filter(location => location.id === user.branch.toString());
    }
    return locations;
  }, [locations, isBranchAdmin, user?.branch]);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [selectedAssetItems, setSelectedAssetItems] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!addAsset);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<Asset | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAssetItemForEdit, setSelectedAssetItemForEdit] = useState<AssetItem | null>(null);
  const [isEditAssetItemDialogOpen, setIsEditAssetItemDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{field: string, direction: "asc" | "desc"}>({
    field: "name",
    direction: "asc"
  });
  
  const [filters, setFilters] = useState<AssetFilters>({
    category: "all",
    location: "all",
    vendor: "all",
  });

  // Auto-set location filter for branch admins
  useEffect(() => {
    if (isBranchAdmin && user?.branch && availableLocations.length > 0) {
      const branchLocation = availableLocations[0];
      if (branchLocation) {
        setFilters(prev => ({
          ...prev,
          location: branchLocation.id
        }));
      }
    }
  }, [isBranchAdmin, user?.branch, availableLocations]);

  // Filtered and sorted data
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter((asset) => {
      const matchesSearch = searchQuery === "" || 
        asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (locations.find(loc => 
          loc.id === asset.location || 
          loc.id === String(asset.location) || 
          loc.name === asset.location
        )?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (() => {
          // Comprehensive category name lookup for search
          const assetAny = asset as any;
          const category = categories.find(c => 
            c.name === asset.categoryName ||
            c.id === assetAny.categoryId || 
            c.id === Number(assetAny.category) || 
            c.id.toString() === assetAny.category ||
            c.name === assetAny.category
          );
          const categoryName = category?.name || asset.categoryName || assetAny.category || '';
          return categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        })() ||
        (() => {
          const vendor = vendors.find(v => 
            v.id === asset.vendorId || 
            v.id === Number(asset.vendor) || 
            v.id.toString() === asset.vendor ||
            v.name === asset.vendor
          );
          const vendorName = vendor?.name || asset.vendor || '';
          return vendorName.toLowerCase().includes(searchQuery.toLowerCase());
        })();
      
      const matchesLocation = filters.location === "all" || asset.location === filters.location;
      const matchesCategory = filters.category === "all" || (() => {
        // More comprehensive category matching for filtering
        const assetAny = asset as any;
        const category = categories.find(c => 
          c.name === asset.categoryName ||
          c.id === assetAny.categoryId || 
          c.id === Number(assetAny.category) || 
          c.id.toString() === assetAny.category ||
          c.name === assetAny.category
        );
        return category?.name === filters.category;
      })();
      const matchesVendor = filters.vendor === "all" || 
        (asset.vendorId && asset.vendorId.toString() === filters.vendor) ||
        (asset.vendor && asset.vendor === filters.vendor) ||
        (asset.vendor && Number(asset.vendor).toString() === filters.vendor);
      
      return matchesSearch && matchesLocation && matchesCategory && matchesVendor;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Special handling for different field types
      if (sortConfig.field === "categoryName") {
        // Use the same comprehensive category lookup for sorting
        const getCategory = (asset: any) => {
          const assetAny = asset as any;
          const category = categories.find(c => 
            c.name === asset.categoryName ||
            c.id === assetAny.categoryId || 
            c.id === Number(assetAny.category) || 
            c.id.toString() === assetAny.category ||
            c.name === assetAny.category
          );
          return category?.name || asset.categoryName || assetAny.category || 'Unknown';
        };
        
        aValue = getCategory(a);
        bValue = getCategory(b);
      } else if (sortConfig.field === "location") {
        // Use location name lookup for sorting
        const getLocation = (asset: any) => {
          const locationName = locations.find(loc => 
            loc.id === asset.location || 
            loc.id === String(asset.location) || 
            loc.name === asset.location
          )?.name || asset.location || 'Unknown';
          return locationName;
        };
        
        aValue = getLocation(a);
        bValue = getLocation(b);
      } else if (sortConfig.field === "vendor") {
        // Use vendor name lookup for sorting
        const getVendor = (asset: any) => {
          const vendor = vendors.find(v => 
            v.id === asset.vendorId || 
            v.id === Number(asset.vendor) || 
            v.id.toString() === asset.vendor ||
            v.name === asset.vendor
          );
          const vendorName = vendor?.name || asset.vendor || 'N/A';
          return vendorName;
        };
        
        aValue = getVendor(a);
        bValue = getVendor(b);
      } else {
        aValue = a[sortConfig.field as keyof typeof a] as any;
        bValue = b[sortConfig.field as keyof typeof b] as any;
      }
      
      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assets, searchQuery, filters, sortConfig, categories, locations, vendors]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAssets.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = filteredAndSortedAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleSort = (field: string) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        // Same field, toggle direction
        const newDirection = prev.direction === "asc" ? "desc" : "asc";
        return { field, direction: newDirection };
      } else {
        // Different field, set to asc
        return { field, direction: "asc" };
      }
    });
  };

  /**
   * Handles asset selection/deselection.
   * When an asset is selected, all its loaded asset items are automatically selected.
   * When an asset is deselected, all its loaded asset items are automatically deselected.
   */
  const handleSelectAsset = (assetId: number) => {
    const newSelection = new Set(selectedAssets);
    const newAssetItemSelection = new Set(selectedAssetItems);
    
    if (newSelection.has(assetId)) {
      // Deselecting asset - also deselect all its asset items
      newSelection.delete(assetId);
      
      // Get asset items for this asset if they're already loaded
      const assetItems = queryClient.getQueryData(
        assetItemsByAssetIdQueryOptions(assetId).queryKey
      ) as AssetItem[] || [];
      
      // Remove all asset items for this asset from selection
      assetItems.forEach(item => {
        const itemIdentifier = item._computedId || item.serial_number || `${item.asset}_${item.serial_number}`;
        newAssetItemSelection.delete(itemIdentifier);
      });
    } else {
      // Selecting asset - also select all its asset items
      newSelection.add(assetId);
      
      // Get asset items for this asset if they're already loaded
      const assetItems = queryClient.getQueryData(
        assetItemsByAssetIdQueryOptions(assetId).queryKey
      ) as AssetItem[] || [];
      
      // Add all asset items for this asset to selection
      assetItems.forEach(item => {
        const itemIdentifier = item._computedId || item.serial_number || `${item.asset}_${item.serial_number}`;
        newAssetItemSelection.add(itemIdentifier);
      });
    }
    
    setSelectedAssets(newSelection);
    setSelectedAssetItems(newAssetItemSelection);
  };

  /**
   * Handles individual asset item selection/deselection.
   * When an asset item is selected and all items for that asset become selected, the asset is automatically selected.
   * When an asset item is deselected, the asset is automatically deselected (regardless of other items).
   */
  const handleSelectAssetItem = (item: AssetItem) => {
    // Use computed ID or serial number as fallback for identification
    const itemIdentifier = item._computedId || item.serial_number || `${item.asset}_${item.serial_number}`;
    
    const newAssetItemSelection = new Set(selectedAssetItems);
    const newAssetSelection = new Set(selectedAssets);
    const wasSelected = newAssetItemSelection.has(itemIdentifier);
    
    if (wasSelected) {
      newAssetItemSelection.delete(itemIdentifier);
      // If this was the last selected item for this asset, deselect the asset too
      newAssetSelection.delete(item.asset);
    } else {
      newAssetItemSelection.add(itemIdentifier);
      
      // Check if all asset items for this asset are now selected
      const assetItems = queryClient.getQueryData(
        assetItemsByAssetIdQueryOptions(item.asset).queryKey
      ) as AssetItem[] || [];
      
      const allItemsSelected = assetItems.length > 0 && assetItems.every(assetItem => {
        const assetItemIdentifier = assetItem._computedId || assetItem.serial_number || `${assetItem.asset}_${assetItem.serial_number}`;
        return newAssetItemSelection.has(assetItemIdentifier);
      });
      
      if (allItemsSelected) {
        newAssetSelection.add(item.asset);
      }
    }
    
    setSelectedAssetItems(newAssetItemSelection);
    setSelectedAssets(newAssetSelection);
  };

  const handleToggleExpand = (assetId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewDetails = (asset: Asset) => {
    setSelectedAssetForDetails(asset);
    setIsDetailsDialogOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAssetForEdit(asset);
    setIsEditDialogOpen(true);
  };

  const handleEditAssetItem = (assetItem: AssetItem) => {
    setSelectedAssetItemForEdit(assetItem);
    setIsEditAssetItemDialogOpen(true);
  };

  // Asset Items Row Component
  const AssetItemsRow = ({ assetId }: { assetId: number }) => {
    const { data: assetItems = [], isLoading, error } = useQuery(assetItemsByAssetIdQueryOptions(assetId));

    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Loading asset items...
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-4 text-red-600">
            Error loading asset items
          </TableCell>
        </TableRow>
      );
    }

    if (assetItems.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-4 text-muted-foreground">
            No asset items found for this asset
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {assetItems.map((item) => (
          <TableRow key={item._computedId || item.serial_number} className="bg-muted/30">
            <TableCell></TableCell> {/* Empty expand cell */}
            <TableCell>
              <Checkbox
                checked={(() => {
                  const itemIdentifier = item._computedId || item.serial_number || `${item.asset}_${item.serial_number}`;
                  const isChecked = selectedAssetItems.has(itemIdentifier);
                  return isChecked;
                })()}
                onCheckedChange={() => handleSelectAssetItem(item)}
              />
            </TableCell>
            <TableCell colSpan={3} className="pl-8 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">#{item.serial_number}</span>
              </div>
            </TableCell>
            <TableCell colSpan={3} className="text-center">
              <Badge 
                variant={item.status === 'AVAILABLE' ? 'default' : 
                        item.status === 'ASSIGNED' ? 'secondary' : 
                        item.status === 'MAINTENANCE' ? 'destructive' : 'outline'}
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell colSpan={4}>
              <div className="flex items-center gap-2 justify-end">
                {item.status === 'AVAILABLE' && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle assign action for available items
                      // This will be implemented in future
                    }}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAssetItem(item);
                  }}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  // Asset Items Dropdown Component
  const AssetItemsDropdown = ({ assetId }: { assetId: number }) => {
    const { data: assetItems = [], isLoading, error } = useQuery(assetItemsByAssetIdQueryOptions(assetId));

    if (isLoading) {
      return (
        <DropdownMenuItem disabled>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent"></div>
            Loading items...
          </div>
        </DropdownMenuItem>
      );
    }

    if (error) {
      return (
        <DropdownMenuItem disabled className="text-red-600">
          Error loading items
        </DropdownMenuItem>
      );
    }

    if (assetItems.length === 0) {
      return (
        <DropdownMenuItem disabled className="text-muted-foreground">
          No asset items found
        </DropdownMenuItem>
      );
    }

    return (
      <>
        <DropdownMenuItem disabled className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
          Asset Items
        </DropdownMenuItem>
        {assetItems.map((item, index) => (
          <div key={item._computedId || item.serial_number}>
            {index > 0 && <div className="h-px bg-border mx-2" />}
            <DropdownMenuItem disabled className="p-0">
              <div className="w-full p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">#{item.serial_number}</span>
                  </div>
                  <Badge 
                    variant={item.status === 'AVAILABLE' ? 'default' : 
                            item.status === 'ASSIGNED' ? 'secondary' : 
                            item.status === 'MAINTENANCE' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {item.status === 'AVAILABLE' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-6 px-2 text-xs flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle assign action for available items
                        // This will be implemented in future
                      }}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Assign
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAssetItem(item);
                    }}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          </div>
        ))}
      </>
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === paginatedAssets.length) {
      // Deselecting all assets - also deselect all asset items
      setSelectedAssets(new Set());
      setSelectedAssetItems(new Set());
    } else {
      // Selecting all assets - also select all their asset items
      const newAssetSelection = new Set(paginatedAssets.map(asset => asset.id));
      const newAssetItemSelection = new Set(selectedAssetItems);
      
      // For each asset, add all its loaded asset items to selection
      paginatedAssets.forEach(asset => {
        const assetItems = queryClient.getQueryData(
          assetItemsByAssetIdQueryOptions(asset.id).queryKey
        ) as AssetItem[] || [];
        
        assetItems.forEach(item => {
          const itemIdentifier = item._computedId || item.serial_number || `${item.asset}_${item.serial_number}`;
          newAssetItemSelection.add(itemIdentifier);
        });
      });
      
      setSelectedAssets(newAssetSelection);
      setSelectedAssetItems(newAssetItemSelection);
    }
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { ...Route.useSearch(), page: newPage } });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    navigate({ search: { addAsset: undefined } });
  };

  // Statistics for summary
  const assetStats = useMemo(() => {
    const total = assets.length;
    
    // Calculate status-based statistics from asset items
    const statusStats = {
      available: assetItems.filter(item => item.status === 'AVAILABLE').length,
      assigned: assetItems.filter(item => item.status === 'ASSIGNED').length,
      maintenance: assetItems.filter(item => item.status === 'MAINTENANCE').length,
      broken: assetItems.filter(item => item.status === 'BROKEN').length,
    };

    return { total, statusStats };
  }, [assets, assetItems]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
        </div>
        
        <div className="flex items-center gap-2">
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
              <div className="text-2xl font-bold text-green-600">
                {assetStats.statusStats.available}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {assetStats.statusStats.assigned}
              </div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {assetStats.statusStats.maintenance}
              </div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {assetStats.statusStats.broken}
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.location}
              onValueChange={(value) => setFilters({ ...filters, location: value })}
              disabled={isBranchAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder={isBranchAdmin ? "Location (Auto-selected)" : "Location"} />
              </SelectTrigger>
              <SelectContent>
                {!isBranchAdmin && <SelectItem value="all">All Locations</SelectItem>}
                {availableLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
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
              onClick={() => setFilters({ category: "all", location: "all", vendor: "all" })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {(selectedAssets.size > 0 || selectedAssetItems.size > 0) && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {selectedAssets.size > 0 
                    ? `${selectedAssets.size} asset(s) selected` 
                    : ''}
                </span>
              </div>
              {selectedAssetItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-blue-600">
                    {selectedAssetItems.size} item(s) selected
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsIssueDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
                Transfer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedAssets(new Set());
                  setSelectedAssetItems(new Set());
                }}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center"></TableHead> {/* Expand column */}
                    <TableHead className="w-16 text-center">
                      <Checkbox
                        checked={selectedAssets.size === paginatedAssets.length && paginatedAssets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer px-2" onClick={() => handleSort("name")}>
                      <div className="flex items-center gap-1">
                      Asset Name
                      <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-center px-2 w-20" onClick={() => handleSort("quantity")}>
                      <div className="flex items-center justify-center gap-1">
                        Quantity
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-8"></TableHead> {/* Empty spacing column */}
                    <TableHead className="cursor-pointer px-4" onClick={() => handleSort("categoryName")}>
                      <div className="flex items-center gap-1">
                        Category
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer px-4" onClick={() => handleSort("location")}>
                      <div className="flex items-center gap-1">
                        Location
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer px-4" onClick={() => handleSort("vendor")}>
                      <div className="flex items-center gap-1">
                        Vendor
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-20 text-center">Details</TableHead>
                    <TableHead className="w-20 text-center">
                      <div className="flex items-center justify-center">
                        Edit
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.flatMap((asset) => [
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleExpand(asset.id)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                expandedRows.has(asset.id) ? 'rotate-180' : ''
                              }`} 
                            />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={selectedAssets.has(asset.id)}
                            onCheckedChange={() => handleSelectAsset(asset.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell className="text-center">{asset.quantity || 0}</TableCell>
                        <TableCell></TableCell> {/* Empty spacing cell */}
                        <TableCell>
                          <Badge variant="outline">
                            {(() => {
                              // More comprehensive category lookup
                              const assetAny = asset as any;
                              const category = categories.find(c => 
                                c.name === asset.categoryName ||
                                c.id === assetAny.categoryId || 
                                c.id === Number(assetAny.category) || 
                                c.id.toString() === assetAny.category ||
                                c.name === assetAny.category
                              );
                              return category?.name || asset.categoryName || assetAny.category || 'Unknown';
                            })()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {locations.find(loc => 
                            loc.id === asset.location || 
                            loc.id === String(asset.location) || 
                            loc.name === asset.location
                          )?.name || asset.location}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            // More comprehensive vendor lookup
                            const vendor = vendors.find(v => 
                              v.id === asset.vendorId || 
                              v.id === Number(asset.vendor) || 
                              v.id.toString() === asset.vendor ||
                              v.name === asset.vendor
                            );
                            return vendor?.name || asset.vendor || 'N/A';
                          })()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(asset)}
                            className="h-8 w-8 p-0"
                            title="View asset details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAsset(asset)}
                            className="h-8 w-8 p-0"
                            title="Edit asset"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>,
                      // Expanded asset items row
                      ...(expandedRows.has(asset.id) ? [<AssetItemsRow key={`${asset.id}-items`} assetId={asset.id} />] : [])
                    ])
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No assets found</p>
                        <p className="text-sm text-muted-foreground/70">
                          {filteredAndSortedAssets.length < assets.length 
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

      {/* Edit Asset Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          {selectedAssetForEdit && (
            <EditAssetForm 
              asset={selectedAssetForEdit} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedAssetForEdit(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Asset Item Dialog */}
      <Dialog open={isEditAssetItemDialogOpen} onOpenChange={setIsEditAssetItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset Item</DialogTitle>
          </DialogHeader>
          {selectedAssetItemForEdit && (
            <EditAssetItemForm 
              assetItem={selectedAssetItemForEdit} 
              onSuccess={() => {
                setIsEditAssetItemDialogOpen(false);
                setSelectedAssetItemForEdit(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAssetForDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Asset Name:</span>
                      <span className="text-sm font-medium">{selectedAssetForDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Description:</span>
                      <span className="text-sm font-medium text-right">
                        {selectedAssetForDetails.description || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm font-medium">
                        {(() => {
                          const assetAny = selectedAssetForDetails as any;
                          const category = categories.find(c => 
                            c.name === selectedAssetForDetails.categoryName ||
                            c.id === assetAny.categoryId || 
                            c.id === Number(assetAny.category) || 
                            c.id.toString() === assetAny.category ||
                            c.name === assetAny.category
                          );
                          return category?.name || selectedAssetForDetails.categoryName || 'Unknown';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="text-sm font-medium">{selectedAssetForDetails.quantity || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="text-sm font-medium">{selectedAssetForDetails.status || 'Available'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Location & Vendor</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm font-medium">
                        {locations.find(loc => 
                          loc.id === selectedAssetForDetails.location || 
                          loc.id === String(selectedAssetForDetails.location) || 
                          loc.name === selectedAssetForDetails.location
                        )?.name || 
                         selectedAssetForDetails.currentLocation || 
                         selectedAssetForDetails.location || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vendor:</span>
                      <span className="text-sm font-medium">
                        {(() => {
                          const vendor = vendors.find(v => 
                            v.id === selectedAssetForDetails.vendorId || 
                            v.id === Number(selectedAssetForDetails.vendor) || 
                            v.id.toString() === selectedAssetForDetails.vendor ||
                            v.name === selectedAssetForDetails.vendor
                          );
                          return vendor?.name || selectedAssetForDetails.vendor || 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchase Price:</span>
                      <span className="text-sm font-medium">
                        {selectedAssetForDetails.purchasePrice 
                          ? `$${selectedAssetForDetails.purchasePrice.toLocaleString()}` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchase Date:</span>
                      <span className="text-sm font-medium">
                        {selectedAssetForDetails.purchaseDate 
                          ? new Date(selectedAssetForDetails.purchaseDate).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Warranty Expiry:</span>
                      <span className="text-sm font-medium">
                        {selectedAssetForDetails.warrantyExpiryDate 
                          ? new Date(selectedAssetForDetails.warrantyExpiryDate).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>



              {/* Timestamps */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Record Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm font-medium">
                        {selectedAssetForDetails.createdAt 
                          ? new Date(selectedAssetForDetails.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="text-sm font-medium">
                        {selectedAssetForDetails.updatedAt 
                          ? new Date(selectedAssetForDetails.updatedAt).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAssetForDetails.notes && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{selectedAssetForDetails.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Assets Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Assets</DialogTitle>
          </DialogHeader>            <div className="space-y-4">
              {selectedAssets.size > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Selected Assets ({selectedAssets.size}):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {paginatedAssets
                      .filter(asset => selectedAssets.has(asset.id))
                      .map(asset => (
                        <div key={asset.id} className="text-sm">
                          {asset.name} (Qty: {asset.quantity || 0})
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {selectedAssetItems.size > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Selected Asset Items ({selectedAssetItems.size}):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Array.from(selectedAssetItems).map(itemId => {
                      // Find the item across all expanded assets
                      let foundItem: any = null;
                      let assetName = '';
                      
                      // This is inefficient but works for demo purposes
                      // In production, you would use a more efficient lookup
                      assets.forEach(asset => {
                        const assetItems = queryClient.getQueryData(
                          assetItemsByAssetIdQueryOptions(asset.id).queryKey
                        ) || [];
                        
                        const item = assetItems.find((item: any) => item.id === itemId);
                        if (item) {
                          foundItem = item;
                          assetName = asset.name;
                        }
                      });
                      
                      return foundItem ? (
                        <div key={itemId} className="text-sm flex items-center justify-between">
                          <span>
                            #{foundItem.serial_number} ({assetName})
                          </span>
                          <Badge 
                            variant={foundItem.status === 'AVAILABLE' ? 'default' : 
                                  foundItem.status === 'ASSIGNED' ? 'secondary' : 
                                  foundItem.status === 'MAINTENANCE' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {foundItem.status}
                          </Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Destination</label>
                  <Select disabled={isBranchAdmin}>
                    <SelectTrigger>
                      <SelectValue placeholder={isBranchAdmin ? "Transfer not available (Branch Admin)" : "Select destination..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isBranchAdmin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Branch admins can only manage assets within their assigned location.
                    </p>
                  )}
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
                    // Handle asset transfer
                    setIsIssueDialogOpen(false);
                    setSelectedAssets(new Set());
                    setSelectedAssetItems(new Set());
                  }}
                >
                  Transfer
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
