import { AddAssetForm } from "@/components/assets/add-asset-form";
import { AssetsListModal } from "@/components/interactive-dashboard-modals/assets-list-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Clock,
  FileText,
  MapPin,
  Package,
  Plus,
  Settings,
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
  value: string;
  icon: React.ReactNode;
  description: string;
  trend?: "up" | "down";
  trendValue?: string;
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend && (
            <>
              {trend === "up" ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span
                className={trend === "up" ? "text-green-500" : "text-red-500"}
              >
                {trendValue}
              </span>
            </>
          )}
          <span className="ml-1">{description}</span>
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
    completed: "success",
    pending: "warning",
    "in-progress": "secondary",
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
  // Set initial loading state to true for first data load
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);
  const { data: assets = [] } = useSuspenseQuery(assetsQueryOptions);

  // Add error handling for assetItems
  const { data: assetItems = [], error: assetItemsError } = useSuspenseQuery(
    assetItemsQueryOptions
  );

  const { data: categoriesStats = [] } = useSuspenseQuery(
    categoriesStatsQueryOptions
  );
  const { data: vendors = [] } = useSuspenseQuery(vendorsQueryOptions);

  // Set error state if any query fails
  React.useEffect(() => {
    if (assetItemsError) {
      setError(assetItemsError as Error);
      console.error("Error fetching asset items:", assetItemsError);
    }
  }, [assetItemsError]);

  // Set loading to false once data is loaded
  React.useEffect(() => {
    if (locations.length > 0 || assets.length > 0) {
      setIsLoading(false);
    }
  }, [locations, assets]);

  // Transform real assets data for the AssetsListModal
  const transformedAssets = assets.map((asset) => ({
    id: asset.id?.toString() || "",
    name: asset.name || "",
    department: asset.categoryName || "", // Use category name instead of department
    location: asset.location || "Unknown",
    status: (asset.status?.toLowerCase() || "available") as
      | "in-use"
      | "available"
      | "maintenance",
    assignedTo: asset.assignedTo || undefined,
  }));

  // Count assets by location
  const assetsByLocation = locations.map((location) => {
    const count = assets.filter(
      (asset) =>
        asset.location &&
        typeof asset.location === "string" &&
        asset.location.includes(location.name)
    ).length;
    return { ...location, assetCount: count };
  });

  // Create recent activities from asset items
  const recentActivities = assetItems.length
    ? assetItems
        // Sort by purchase date from newest to oldest
        .sort((a, b) => {
          const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
          const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        })
        .slice(0, 5)
        .map((item, index) => ({
          id: item.id?.toString() || index.toString(),
          asset: item.asset_name || "Unknown Asset",
          action: determineAction(item),
          location: item.location_name || "Unknown Location",
          date: formatDate(item.purchaseDate),
          status: determineStatus(item.status || ""),
        }))
    : []; // Return empty array if no assetItems

  function determineAction(
    item: any
  ): "assigned" | "maintenance" | "disposed" | "purchased" {
    if (!item || !item.status) return "purchased"; // Default to purchased if no status

    const status = item.status.toUpperCase();
    if (status === "ASSIGNED") return "assigned";
    if (status === "MAINTENANCE") return "maintenance";
    if (status === "BROKEN") return "disposed";
    return "purchased";
  }

  function determineStatus(
    status: string
  ): "completed" | "pending" | "in-progress" {
    if (!status) return "pending"; // Default to pending if no status

    const statusUpper = status.toUpperCase();
    if (statusUpper === "AVAILABLE") return "completed";
    if (statusUpper === "MAINTENANCE") return "in-progress";
    return "pending";
  }

  function formatDate(date: any): string {
    if (!date) return new Date().toISOString().split("T")[0];

    try {
      // If it's already a string in a date format, just extract the date part
      if (typeof date === "string" && date.includes("T")) {
        return date.split("T")[0];
      }

      // If it's a date object or a date string, parse it
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split("T")[0];
      }

      // Fallback to current date
      return new Date().toISOString().split("T")[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return new Date().toISOString().split("T")[0];
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="mt-1 h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="mt-4 h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AssetsListModal assets={transformedAssets}>
          <StatCard
            title="Total Assets"
            value={(assets?.length || 0).toString()}
            icon={<Package className="h-4 w-4" />}
            description="Assets in inventory"
            trend="up"
            trendValue="+4.5%"
          />
        </AssetsListModal>
        <StatCard
          title="Locations"
          value={(locations?.length || 0).toString()}
          icon={<MapPin className="h-4 w-4" />}
          description="Managed in system"
        />
        <StatCard
          title="Categories"
          value={(categoriesStats?.length || 0).toString()}
          icon={<Clock className="h-4 w-4" />}
          description="Asset categories"
          trend="up"
          trendValue="+2.1%"
        />
        <StatCard
          title="Vendors"
          value={(vendors?.length || 0).toString()}
          icon={<AlertCircle className="h-4 w-4" />}
          description="Active vendors"
          trend="up"
          trendValue="+1.2%"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.asset}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (getActionBadge(activity.action)?.variant as
                            | "outline"
                            | "destructive"
                            | "secondary"
                            | "default") || "default"
                        }
                        className="capitalize"
                      >
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(activity.status)}
                        className="capitalize"
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.date}</TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-red-500"
                  >
                    Error loading activities: {error.message}
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No recent activities found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assets Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(assetsByLocation || []).slice(0, 4).map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell className="capitalize">{location.type}</TableCell>
                  <TableCell>{location.assetCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={location.is_blocked ? "destructive" : "default"}
                    >
                      {location.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
