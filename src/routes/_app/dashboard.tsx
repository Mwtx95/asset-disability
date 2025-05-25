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
} from "lucide-react";
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
            value={assetItems.length}
            icon={<Package className="h-5 w-5" />}
            description="Items in inventory"
            trend="up"
            trendValue="+12.5%"
          />
        </AssetsListModal>
        
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
        
        <StatCard
          title="Vendors"
          value={vendors.length}
          icon={<Users className="h-5 w-5" />}
          description="Active vendors"
          trend="up"
          trendValue="+1.2%"
        />
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

      {/* Charts Section Placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Analytics & Charts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visual insights and trends (Coming Soon)
            </p>
          </div>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Charts and analytics will be displayed here
              </p>
              <p className="text-xs text-muted-foreground/70">
                Asset utilization, trends, and performance metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
