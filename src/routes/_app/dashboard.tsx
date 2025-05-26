import { AssetsListModal } from "@/components/interactive-dashboard-modals/assets-list-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Settings,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
  Boxes,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as React from "react";
import { locationQueryOptions } from "@/queries/locations";
import { assetsQueryOptions } from "@/queries/assets";
import { assetItemsQueryOptions } from "@/queries/assetsItems";
import { categoriesStatsQueryOptions } from "@/queries/categories";
import { vendorsQueryOptions } from "@/queries/vendors";
import { useSuspenseQuery } from "@tanstack/react-query";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: "up" | "down";
  trendValue?: string;
  onClick?: () => void;
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  onClick,
}: StatCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:bg-accent/50 transition-colors ${onClick ? 'hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-5 w-5 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trend && trendValue && (
            <>
              {trend === "up" ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={trend === "up" ? "text-green-500" : "text-red-500"}
              >
                {trendValue}
              </span>
              <span className="ml-1">from last month</span>
            </>
          )}
          {!trend && <span>{description}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusCardProps {
  title: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatusCard({ title, count, percentage, icon, color, bgColor }: StatusCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <div className={`h-5 w-5 ${color}`}>{icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">of total</p>
            <p className="text-lg font-semibold">{percentage.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentAssetActivity {
  id: string;
  asset: string;
  action: "assigned" | "maintenance" | "disposed" | "purchased";
  location: string;
  date: string;
  status: "completed" | "pending" | "in-progress";
}

const getStatusColor = (status: RecentAssetActivity["status"]) => {
  const colors = {
    completed: "default",
    pending: "secondary",
    "in-progress": "destructive",
  } as const;
  return colors[status];
};

const getActionBadge = (action: RecentAssetActivity["action"]) => {
  const badges = {
    assigned: { label: "Assigned", variant: "outline" },
    maintenance: { label: "Maintenance", variant: "destructive" },
    disposed: { label: "Disposed", variant: "secondary" },
    purchased: { label: "Purchased", variant: "default" },
  };
  return badges[action] || { label: "Unknown", variant: "default" };
};

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(locationQueryOptions);
    queryClient.ensureQueryData(assetsQueryOptions);
    queryClient.ensureQueryData(assetItemsQueryOptions);
    queryClient.ensureQueryData(categoriesStatsQueryOptions);
    queryClient.ensureQueryData(vendorsQueryOptions);
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);
  const { data: assets = [] } = useSuspenseQuery(assetsQueryOptions);
  const { data: assetItems = [], error: assetItemsError } = useSuspenseQuery(
    assetItemsQueryOptions
  );
  const { data: categoriesStats = [] } = useSuspenseQuery(
    categoriesStatsQueryOptions
  );
  const { data: vendors = [] } = useSuspenseQuery(vendorsQueryOptions);

  // Handle errors
  React.useEffect(() => {
    if (assetItemsError) {
      setError(assetItemsError as Error);
      console.error("Error fetching asset items:", assetItemsError);
    }
  }, [assetItemsError]);

  // Set loading to false once data is loaded
  React.useEffect(() => {
    if (locations.length >= 0 && assets.length >= 0) {
      setIsLoading(false);
    }
  }, [locations, assets]);

  // Transform real assets data for the AssetsListModal
  const transformedAssets = assets.map((asset) => ({
    id: asset.id?.toString() || "",
    name: asset.name || "",
    department: asset.categoryName || "",
    location: asset.location || "Unknown",
    status: (asset.status?.toLowerCase() || "available") as
      | "in-use"
      | "available"
      | "maintenance",
    assignedTo: asset.assignedTo || undefined,
  }));

  // Calculate asset status breakdown
  const statusBreakdown = React.useMemo(() => {
    const totalItems = assetItems.length;
    const breakdown = {
      available: assetItems.filter(item => item.status === 'AVAILABLE').length,
      assigned: assetItems.filter(item => item.status === 'ASSIGNED').length,
      maintenance: assetItems.filter(item => item.status === 'MAINTENANCE').length,
      broken: assetItems.filter(item => item.status === 'BROKEN').length,
    };

    return {
      available: {
        count: breakdown.available,
        percentage: totalItems > 0 ? (breakdown.available / totalItems) * 100 : 0,
      },
      assigned: {
        count: breakdown.assigned,
        percentage: totalItems > 0 ? (breakdown.assigned / totalItems) * 100 : 0,
      },
      maintenance: {
        count: breakdown.maintenance,
        percentage: totalItems > 0 ? (breakdown.maintenance / totalItems) * 100 : 0,
      },
      broken: {
        count: breakdown.broken,
        percentage: totalItems > 0 ? (breakdown.broken / totalItems) * 100 : 0,
      },
    };
  }, [assetItems]);

  // Prepare donut chart data
  const chartData = React.useMemo(() => [
    { 
      name: 'Available', 
      value: statusBreakdown.available.count, 
      color: '#10b981',
      percentage: statusBreakdown.available.percentage 
    },
    { 
      name: 'Assigned', 
      value: statusBreakdown.assigned.count, 
      color: '#3b82f6',
      percentage: statusBreakdown.assigned.percentage 
    },
    { 
      name: 'Maintenance', 
      value: statusBreakdown.maintenance.count, 
      color: '#f59e0b',
      percentage: statusBreakdown.maintenance.percentage 
    },
    { 
      name: 'Broken', 
      value: statusBreakdown.broken.count, 
      color: '#ef4444',
      percentage: statusBreakdown.broken.percentage 
    },
  ].filter(item => item.value > 0), [statusBreakdown]);

  // Prepare stacked bar chart data for assets by category and location
  const stackedBarData = React.useMemo(() => {
    if (!assets.length || !locations.length || !categoriesStats.length) return [];

    // Create a mapping of category name to location counts
    const categoryLocationMap = new Map<string, Map<string, number>>();

    // Initialize categories from categoriesStats
    categoriesStats.forEach(category => {
      categoryLocationMap.set(category.name, new Map());
    });

    // Count assets by category and location
    assets.forEach(asset => {
      const categoryName = asset.categoryName || 'Unknown';
      const locationName = locations.find(loc => 
        loc.id === asset.location || 
        loc.id === String(asset.location) || 
        loc.name === asset.location
      )?.name || asset.location || 'Unknown';

      if (!categoryLocationMap.has(categoryName)) {
        categoryLocationMap.set(categoryName, new Map());
      }

      const locationMap = categoryLocationMap.get(categoryName)!;
      locationMap.set(locationName, (locationMap.get(locationName) || 0) + 1);
    });

    // Convert to format needed for recharts
    const chartData = Array.from(categoryLocationMap.entries()).map(([category, locationMap]) => {
      const categoryData: any = { category };
      
      // Add each location as a property
      locations.forEach(location => {
        categoryData[location.name] = locationMap.get(location.name) || 0;
      });

      return categoryData;
    }).filter(item => {
      // Only include categories that have at least one asset
      const total = locations.reduce((sum, loc) => sum + (item[loc.name] || 0), 0);
      return total > 0;
    });

    return chartData;
  }, [assets, locations, categoriesStats]);

  // Generate colors for each location/branch
  const locationColors = React.useMemo(() => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // orange
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316', // orange-500
      '#ec4899', // pink
      '#6366f1', // indigo
    ];
    
    const colorMap: Record<string, string> = {};
    locations.forEach((location, index) => {
      colorMap[location.name] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [locations]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Count: {data.value}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Create recent activities from asset items (last 5 activities)
  const recentActivities = React.useMemo(() => {
    if (!assetItems.length) return [];
    
    return assetItems
      .sort((a, b) => {
        const dateA = a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
        const dateB = b.purchase_date ? new Date(b.purchase_date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((item, index) => ({
        id: item.id?.toString() || index.toString(),
        asset: item.asset_name || "Unknown Asset",
        action: determineAction(item),
        location: item.location_name || "Unknown Location",
        date: formatDate(item.purchase_date),
        status: determineStatus(item.status || ""),
      }));
  }, [assetItems]);

  function determineAction(
    item: any
  ): "assigned" | "maintenance" | "disposed" | "purchased" {
    if (!item || !item.status) return "purchased";

    const status = item.status.toUpperCase();
    if (status === "ASSIGNED") return "assigned";
    if (status === "MAINTENANCE") return "maintenance";
    if (status === "BROKEN") return "disposed";
    return "purchased";
  }

  function determineStatus(
    status: string
  ): "completed" | "pending" | "in-progress" {
    if (!status) return "pending";

    const statusUpper = status.toUpperCase();
    if (statusUpper === "AVAILABLE") return "completed";
    if (statusUpper === "MAINTENANCE") return "in-progress";
    return "pending";
  }

  function formatDate(date: any): string {
    if (!date) return new Date().toISOString().split("T")[0];

    try {
      if (typeof date === "string" && date.includes("T")) {
        return date.split("T")[0];
      }

      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split("T")[0];
      }

      return new Date().toISOString().split("T")[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toISOString().split("T")[0];
    }
  }

  const getActionBadge = (action: RecentAssetActivity["action"]) => {
    const badges = {
      assigned: { label: "Assigned", variant: "outline" },
      maintenance: { label: "Maintenance", variant: "destructive" },
      disposed: { label: "Disposed", variant: "secondary" },
      purchased: { label: "Purchased", variant: "default" },
    };
    return badges[action] || { label: "Unknown", variant: "default" };
  };

  const getStatusColor = (status: RecentAssetActivity["status"]) => {
    const colors = {
      completed: "default",
      pending: "secondary",
      "in-progress": "destructive",
    } as const;
    return colors[status];
  };

  // Asset Distribution by Location data
  const locationDistributionData = React.useMemo(() => {
    if (!assets.length && !assetItems.length) return [];
    
    // Count assets and asset items by location with proper name mapping
    const locationCounts: Record<string, { assets: number; assetItems: number }> = {};
    
    // Count assets by location
    assets.forEach(asset => {
      // Find the location name by matching the location ID or name
      const locationObj = locations.find(loc => 
        loc.id === asset.location || 
        loc.id === String(asset.location) || 
        loc.name === asset.location
      );
      
      const locationName = locationObj?.name || asset.location || 'Unknown Location';
      if (!locationCounts[locationName]) {
        locationCounts[locationName] = { assets: 0, assetItems: 0 };
      }
      locationCounts[locationName].assets += 1;
    });

    // Count asset items by location
    assetItems.forEach(item => {
      // Find the location name by matching the location ID or name
      const locationObj = locations.find(loc => 
        loc.id === String(item.location) || 
        loc.name === item.location_name
      );
      
      const locationName = locationObj?.name || item.location_name || 'Unknown Location';
      if (!locationCounts[locationName]) {
        locationCounts[locationName] = { assets: 0, assetItems: 0 };
      }
      locationCounts[locationName].assetItems += 1;
    });
    
    // Convert to chart format and sort by total count descending
    return Object.entries(locationCounts)
      .map(([location, counts]) => ({
        location,
        locationName: location, // Use the mapped location name
        assets: counts.assets,
        assetItems: counts.assetItems,
        total: counts.assets + counts.assetItems,
        assetsPercentage: (counts.assets + counts.assetItems) > 0 ? (counts.assets / (counts.assets + counts.assetItems)) * 100 : 0,
        assetItemsPercentage: (counts.assets + counts.assetItems) > 0 ? (counts.assetItems / (counts.assets + counts.assetItems)) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [assets, assetItems, locations]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-[200px]" />
        </div>
        
        {/* Top-level stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="mt-1 h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="mt-1 h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status breakdown skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent activities skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your asset management system
          </p>
        </div>
      </div>

      {/* Top-level Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AssetsListModal assets={transformedAssets}>
          <StatCard
            title="Total Assets"
            value={assets.length}
            icon={<Package className="h-5 w-5" />}
            description="Unique asset types"
            trend="up"
            trendValue="+12.5%"
          />
        </AssetsListModal>
        
        <StatCard
          title="Total Asset Items"
          value={assetItems.length}
          icon={<Boxes className="h-5 w-5" />}
          description="Individual items in inventory"
          trend="up"
          trendValue="+8.3%"
        />
        
        <StatCard
          title="Locations (Branches)"
          value={locations.length}
          icon={<Building2 className="h-5 w-5" />}
          description="Active locations"
          trend="up"
          trendValue="+2.1%"
        />
        
        <StatCard
          title="Categories"
          value={categoriesStats.length}
          icon={<Settings className="h-5 w-5" />}
          description="Asset categories"
          trend="up"
          trendValue="+5.3%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatCard
          title="Vendors"
          value={vendors.length}
          icon={<Users className="h-5 w-5" />}
          description="Active vendors"
          trend="up"
          trendValue="+1.2%"
        />
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asset to Items Ratio</p>
              <p className="text-3xl font-bold">
                {assets.length > 0 ? (assetItems.length / assets.length).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average items per asset type
              </p>
            </div>
            <div className="h-5 w-5 text-muted-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Status Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Asset Status Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="Available"
            count={statusBreakdown.available.count}
            percentage={statusBreakdown.available.percentage}
            icon={<CheckCircle />}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          
          <StatusCard
            title="Assigned"
            count={statusBreakdown.assigned.count}
            percentage={statusBreakdown.assigned.percentage}
            icon={<Users />}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          
          <StatusCard
            title="Maintenance"
            count={statusBreakdown.maintenance.count}
            percentage={statusBreakdown.maintenance.percentage}
            icon={<Wrench />}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
          
          <StatusCard
            title="Broken"
            count={statusBreakdown.broken.count}
            percentage={statusBreakdown.broken.percentage}
            icon={<XCircle />}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut Chart - Asset Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Asset Status Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visual breakdown of asset items by status
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="flex items-center justify-center h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => 
                        `${value}: ${entry.payload.value} (${entry.payload.percentage.toFixed(1)}%)`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No asset data available for chart
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Add some assets to see the status distribution
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Asset Distribution by Location */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Asset Distribution by Location</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assets and asset items across all locations
              </p>
            </div>
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {locationDistributionData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationDistributionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="location" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Location: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="assets"
                      fill="#3b82f6"
                      name="Asset Types"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="assetItems"
                      fill="#10b981"
                      name="Asset Items"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No location data available for chart
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Add some assets to see the location distribution
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activities
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest asset movements and updates
          </p>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground p-1.5 bg-muted rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.asset}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        (getActionBadge(activity.action)?.variant as
                          | "outline"
                          | "destructive"
                          | "secondary"
                          | "default") || "default"
                      }
                    >
                      {activity.action}
                    </Badge>
                    <Badge variant={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {activity.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-500">Error loading activities: {error.message}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground">No recent activities found</p>
              <p className="text-sm text-muted-foreground/70">
                Activities will appear here as assets are managed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
