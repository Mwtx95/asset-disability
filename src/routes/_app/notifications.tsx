import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
  AlertTriangle,
  Info,
  Package,
  Settings,
  Users,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import { z } from "zod";

// Notification types
interface Notification {
  id: number;
  title: string;
  message: string;
  type: "system" | "asset" | "user" | "maintenance" | "alert";
  priority: "low" | "medium" | "high" | "critical";
  status: "unread" | "read" | "archived";
  timestamp: string;
  branch: "unguja" | "pemba" | "headquarters";
  actionUrl?: string;
  relatedEntity?: {
    type: "asset" | "user" | "location";
    id: number;
    name: string;
  };
}

interface NotificationFilters {
  priority: string;
  status: string;
  type: string;
  branch: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

const ITEMS_PER_PAGE = 15;

// Mock data - in a real app, this would come from an API
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Asset Maintenance Required",
    message: "Dell Laptop DL-001 requires scheduled maintenance. Last maintenance was 6 months ago.",
    type: "maintenance",
    priority: "high",
    status: "unread",
    timestamp: "2024-01-15T10:30:00Z",
    branch: "unguja",
    actionUrl: "/assets/1",
    relatedEntity: { type: "asset", id: 1, name: "Dell Laptop DL-001" },
  },
  {
    id: 2,
    title: "New Asset Added",
    message: "HP Printer HP-003 has been successfully added to the inventory.",
    type: "asset",
    priority: "medium",
    status: "unread",
    timestamp: "2024-01-15T09:15:00Z",
    branch: "pemba",
    relatedEntity: { type: "asset", id: 3, name: "HP Printer HP-003" },
  },
  {
    id: 3,
    title: "Low Inventory Alert",
    message: "Office Chairs inventory is running low. Only 2 items remaining.",
    type: "alert",
    priority: "critical",
    status: "read",
    timestamp: "2024-01-14T16:45:00Z",
    branch: "unguja",
  },
  {
    id: 4,
    title: "User Access Granted",
    message: "John Doe has been granted access to the Assets Management module.",
    type: "user",
    priority: "low",
    status: "read",
    timestamp: "2024-01-14T14:20:00Z",
    branch: "headquarters",
    relatedEntity: { type: "user", id: 1, name: "John Doe" },
  },
  {
    id: 5,
    title: "System Backup Completed",
    message: "Weekly system backup completed successfully at 02:00 AM.",
    type: "system",
    priority: "low",
    status: "read",
    timestamp: "2024-01-14T02:00:00Z",
    branch: "headquarters",
  },
  {
    id: 6,
    title: "Asset Assignment",
    message: "MacBook Pro MB-002 has been assigned to Jane Smith in IT Department.",
    type: "asset",
    priority: "medium",
    status: "unread",
    timestamp: "2024-01-13T11:30:00Z",
    branch: "pemba",
    relatedEntity: { type: "asset", id: 2, name: "MacBook Pro MB-002" },
  },
  {
    id: 7,
    title: "Maintenance Completed",
    message: "Scheduled maintenance for Office Printer OP-001 has been completed successfully.",
    type: "maintenance",
    priority: "medium",
    status: "archived",
    timestamp: "2024-01-12T15:45:00Z",
    branch: "unguja",
    relatedEntity: { type: "asset", id: 4, name: "Office Printer OP-001" },
  },
  {
    id: 8,
    title: "Critical System Alert",
    message: "Database connection issues detected. System performance may be affected.",
    type: "system",
    priority: "critical",
    status: "unread",
    timestamp: "2024-01-12T08:20:00Z",
    branch: "headquarters",
  },
  {
    id: 9,
    title: "Asset Transfer Request",
    message: "Request to transfer 5 wheelchairs from Unguja to Pemba branch.",
    type: "asset",
    priority: "medium",
    status: "unread",
    timestamp: "2024-01-11T13:15:00Z",
    branch: "pemba",
    relatedEntity: { type: "asset", id: 5, name: "Wheelchairs" },
  },
  {
    id: 10,
    title: "User Registration Approved",
    message: "New disability registration for Ali Hassan has been approved in Pemba.",
    type: "user",
    priority: "low",
    status: "read",
    timestamp: "2024-01-11T10:30:00Z",
    branch: "pemba",
    relatedEntity: { type: "user", id: 2, name: "Ali Hassan" },
  },
  {
    id: 11,
    title: "Quarterly Report Generated",
    message: "Q1 2024 disability services report has been generated for Unguja branch.",
    type: "system",
    priority: "low",
    status: "read",
    timestamp: "2024-01-10T16:00:00Z",
    branch: "unguja",
  },
  {
    id: 12,
    title: "Equipment Deployment",
    message: "20 hearing aids successfully deployed to Pemba branch community centers.",
    type: "asset",
    priority: "high",
    status: "read",
    timestamp: "2024-01-10T09:45:00Z",
    branch: "pemba",
    relatedEntity: { type: "asset", id: 6, name: "Hearing Aids" },
  },
];

export const Route = createFileRoute("/_app/notifications")({
  validateSearch: z.object({
    page: z.number().optional().catch(1),
    priority: z.string().optional().catch("all"),
    status: z.string().optional().catch("all"),
    type: z.string().optional().catch("all"),
    branch: z.string().optional().catch("all"),
    search: z.string().optional().catch(""),
  }),
  component: NotificationsRoute,
});

function NotificationsRoute() {
  const navigate = Route.useNavigate();
  const { page = 1, priority = "all", status = "all", type = "all", branch = "all", search = "" } = Route.useSearch();

  // State
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  
  const [filters, setFilters] = useState<NotificationFilters>({
    priority,
    status,
    type,
    branch,
  });

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    navigate({
      search: {
        page: 1,
        ...updatedFilters,
        search: searchQuery,
      },
    });
  };

  const updateSearch = (query: string) => {
    setSearchQuery(query);
    navigate({
      search: {
        page: 1,
        ...filters,
        search: query,
      },
    });
  };

  // Filtered and paginated notifications
  const { filteredNotifications, totalPages } = useMemo(() => {
    let filtered = mockNotifications.filter((notification) => {
      const matchesSearch =
        searchQuery === "" ||
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = filters.priority === "all" || notification.priority === filters.priority;
      const matchesStatus = filters.status === "all" || notification.status === filters.status;
      const matchesType = filters.type === "all" || notification.type === filters.type;
      const matchesBranch = filters.branch === "all" || notification.branch === filters.branch;

      return matchesSearch && matchesPriority && matchesStatus && matchesType && matchesBranch;
    });

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedResults = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { filteredNotifications: paginatedResults, totalPages };
  }, [searchQuery, filters, page]);

  // Helper functions
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const icons = {
      system: Settings,
      asset: Package,
      user: Users,
      maintenance: Settings,
      alert: AlertTriangle,
    };
    return icons[type] || Bell;
  };

  const getPriorityBadgeVariant = (priority: Notification["priority"]) => {
    const variants = {
      low: "secondary" as const,
      medium: "default" as const,
      high: "warning" as const,
      critical: "destructive" as const,
    };
    return variants[priority];
  };

  const getTypeBadgeVariant = (type: Notification["type"]) => {
    const variants = {
      system: "outline" as const,
      asset: "default" as const,
      user: "secondary" as const,
      maintenance: "warning" as const,
      alert: "destructive" as const,
    };
    return variants[type];
  };

  const getBranchBadgeVariant = (branch: Notification["branch"]) => {
    const variants = {
      unguja: "default" as const,
      pemba: "secondary" as const,
      headquarters: "outline" as const,
    };
    return variants[branch];
  };

  const getBranchDisplayName = (branch: Notification["branch"]) => {
    const names = {
      unguja: "Unguja",
      pemba: "Pemba", 
      headquarters: "HQ",
    };
    return names[branch];
  };

  const markAsRead = (notificationId: number) => {
    // In a real app, this would call an API
    console.log(`Marking notification ${notificationId} as read`);
  };

  const markAllAsRead = () => {
    // In a real app, this would call an API
    console.log("Marking all notifications as read");
  };

  const deleteNotification = (notificationId: number) => {
    // In a real app, this would call an API
    console.log(`Deleting notification ${notificationId}`);
  };

  const bulkAction = (action: "read" | "archive" | "delete") => {
    // In a real app, this would call an API
    console.log(`Bulk ${action} for notifications:`, Array.from(selectedNotifications));
    setSelectedNotifications(new Set());
  };

  const unreadCount = mockNotifications.filter(n => n.status === "unread").length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated with important events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
          {selectedNotifications.size > 0 && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => bulkAction("read")}>
                Mark Read
              </Button>
              <Button variant="outline" size="sm" onClick={() => bulkAction("archive")}>
                Archive
              </Button>
              <Button variant="destructive" size="sm" onClick={() => bulkAction("delete")}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{mockNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockNotifications.filter(n => n.priority === "critical").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockNotifications.filter(n => n.status === "read").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unguja Branch</p>
                <p className="text-2xl font-bold">
                  {mockNotifications.filter(n => n.branch === "unguja").length}
                </p>
              </div>
              <Badge variant="default">Unguja</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pemba Branch</p>
                <p className="text-2xl font-bold">
                  {mockNotifications.filter(n => n.branch === "pemba").length}
                </p>
              </div>
              <Badge variant="secondary">Pemba</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
                <p className="text-2xl font-bold">
                  {mockNotifications.filter(n => n.branch === "headquarters").length}
                </p>
              </div>
              <Badge variant="outline">HQ</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <Select
              value={filters.priority}
              onValueChange={(value) => updateFilters({ priority: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilters({ status: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => updateFilters({ type: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>

            {/* Branch Filter */}
            <Select
              value={filters.branch}
              onValueChange={(value) => updateFilters({ branch: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="unguja">Unguja</SelectItem>
                <SelectItem value="pemba">Pemba</SelectItem>
                <SelectItem value="headquarters">Headquarters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Notifications {filteredNotifications.length > 0 && `(${filteredNotifications.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No notifications found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || Object.values(filters).some(f => f !== "all") 
                  ? "Try adjusting your search or filter criteria"
                  : "You're all caught up! No new notifications at this time."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type);
                const isSelected = selectedNotifications.has(notification.id);
                const isUnread = notification.status === "unread";
                
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-muted/50 transition-colors ${
                      isUnread ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    } ${isSelected ? "bg-muted" : ""}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedNotifications);
                          if (e.target.checked) {
                            newSelected.add(notification.id);
                          } else {
                            newSelected.delete(notification.id);
                          }
                          setSelectedNotifications(newSelected);
                        }}
                        className="mt-1"
                      />

                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        notification.priority === "critical" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" :
                        notification.priority === "high" ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`text-sm font-medium ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </h4>
                              {isUnread && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Badge variant={getPriorityBadgeVariant(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              <Badge variant={getTypeBadgeVariant(notification.type)}>
                                {notification.type}
                              </Badge>
                              <Badge variant={getBranchBadgeVariant(notification.branch)}>
                                {getBranchDisplayName(notification.branch)}
                              </Badge>
                              {notification.relatedEntity && (
                                <span className="text-xs text-muted-foreground">
                                  Related to: {notification.relatedEntity.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredNotifications.length)} of {filteredNotifications.length} notifications
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ search: { ...Route.useSearch(), page: page - 1 } })}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      return pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1;
                    })
                    .map((pageNum, index, array) => (
                      <div key={pageNum} className="flex items-center">
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => navigate({ search: { ...Route.useSearch(), page: pageNum } })}
                        >
                          {pageNum}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ search: { ...Route.useSearch(), page: page + 1 } })}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
