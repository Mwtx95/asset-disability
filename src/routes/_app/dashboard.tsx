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
  Package,
  Plus,
  Settings,
} from "lucide-react";
import * as React from "react";

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
  department: string;
  date: string;
  status: "completed" | "pending" | "in-progress";
}

const mockRecentActivities: RecentAssetActivity[] = [
  {
    id: "1",
    asset: "Hearing Aid",
    action: "assigned",
    department: "Audio Department",
    date: "2024-03-15",
    status: "completed",
  },
  {
    id: "2",
    asset: "Wheelchair",
    action: "purchased",
    department: "Accessibility",
    date: "2024-03-14",
    status: "pending",
  },
  {
    id: "3",
    asset: "Braille Display",
    action: "maintenance",
    department: "IT Department",
    date: "2024-03-13",
    status: "in-progress",
  },
];

const getStatusColor = (status: RecentAssetActivity["status"]) => {
  const colors = {
    completed: "bg-green-500/10 text-green-500",
    pending: "bg-yellow-500/10 text-yellow-500",
    "in-progress": "bg-blue-500/10 text-blue-500",
  };
  return colors[status];
};

const getActionBadge = (action: RecentAssetActivity["action"]) => {
  const badges = {
    assigned: { label: "Assigned", variant: "outline" },
    maintenance: { label: "Maintenance", variant: "destructive" },
    disposed: { label: "Disposed", variant: "secondary" },
    purchased: { label: "Purchased", variant: "default" },
  };
  return badges[action];
};

interface MockAssets {
  id: string;
  name: string;
  department: string;
  status: "in-use" | "available" | "maintenance";
  assignedTo?: string;
}

const mockAssets: MockAssets[] = [
  {
    id: "1",
    name: "Hearing Aid Model X",
    department: "Audio Department",
    status: "in-use",
    assignedTo: "John Doe",
  },
  {
    id: "2",
    name: "Wheelchair Type A",
    department: "Mobility",
    status: "available",
  },
  {
    id: "3",
    name: "Visual Aid Device",
    department: "Vision Support",
    status: "maintenance",
  },
  {
    id: "4",
    name: "Support Crutches",
    department: "Mobility",
    status: "in-use",
    assignedTo: "Jane Smith",
  },
];

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const [isLoading] = React.useState(false);

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
        <AssetsListModal assets={mockAssets}>
          <StatCard
            title="Total Assets"
            value="284"
            icon={<Package className="h-4 w-4" />}
            description="Assets in inventory"
            trend="up"
            trendValue="+4.5%"
          />
        </AssetsListModal>
        <StatCard
          title="Departments"
          value="8"
          icon={<Building2 className="h-4 w-4" />}
          description="Using asset management"
        />
        <StatCard
          title="Pending Requests"
          value="12"
          icon={<Clock className="h-4 w-4" />}
          description="Awaiting approval"
          trend="up"
          trendValue="+8.2%"
        />
        <StatCard
          title="Issues Reported"
          value="4"
          icon={<AlertCircle className="h-4 w-4" />}
          description="In the last month"
          trend="down"
          trendValue="-2.3%"
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
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.asset}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getActionBadge(activity.action)}
                      className="capitalize"
                    >
                      {activity.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.department}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
