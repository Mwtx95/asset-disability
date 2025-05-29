import { createFileRoute, redirect } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Search, 
  Download, 
  Filter,
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  User,
  Settings,
  Database,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/stores/auth';

export const Route = createFileRoute('/_app/logs')({
  beforeLoad: ({ context }) => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'super_admin') {
      throw redirect({
        to: '/dashboard',
        search: {
          message: 'Access denied. You do not have permission to view logs.',
        },
      });
    }
  },
  component: RouteComponent,
});

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: 'auth' | 'asset' | 'user' | 'system' | 'security';
  action: string;
  user: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

// Mock data - replace with actual API calls
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2025-05-28 10:45:32',
    level: 'info',
    category: 'auth',
    action: 'User Login',
    user: 'john.doe@example.com',
    details: 'Successful login from dashboard',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    timestamp: '2025-05-28 10:30:15',
    level: 'success',
    category: 'asset',
    action: 'Asset Created',
    user: 'jane.smith@example.com',
    details: 'Created new asset: Laptop Dell XPS 13',
    ipAddress: '192.168.1.105'
  },
  {
    id: '3',
    timestamp: '2025-05-28 10:15:08',
    level: 'warning',
    category: 'system',
    action: 'Database Connection',
    user: 'system',
    details: 'Database connection pool approaching limit (85%)',
  },
  {
    id: '4',
    timestamp: '2025-05-28 09:45:22',
    level: 'error',
    category: 'security',
    action: 'Failed Login Attempt',
    user: 'unknown@example.com',
    details: 'Multiple failed login attempts detected',
    ipAddress: '203.0.113.1'
  },
  {
    id: '5',
    timestamp: '2025-05-28 09:30:45',
    level: 'info',
    category: 'user',
    action: 'User Updated',
    user: 'admin@example.com',
    details: 'Updated user role for mike.johnson@example.com',
    ipAddress: '192.168.1.102'
  },
  {
    id: '6',
    timestamp: '2025-05-28 09:15:33',
    level: 'success',
    category: 'asset',
    action: 'Asset Assigned',
    user: 'jane.smith@example.com',
    details: 'Asset assigned to John Doe - IT Department',
    ipAddress: '192.168.1.105'
  }
];

function RouteComponent() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    
    // Date filtering
    const logDate = new Date(log.timestamp);
    const matchesDateRange = (!startDate || logDate >= startDate) && 
                            (!endDate || logDate <= endDate);
    
    return matchesSearch && matchesLevel && matchesCategory && matchesDateRange;
  });

  const getLevelIcon = (level: LogEntry['level']) => {
    const icons = {
      info: <Info className="h-4 w-4 text-blue-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      error: <XCircle className="h-4 w-4 text-red-500" />,
      success: <CheckCircle className="h-4 w-4 text-green-500" />
    };
    return icons[level];
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    const variants = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800'
    };
    
    return <Badge className={variants[level]}>{level}</Badge>;
  };

  const getCategoryIcon = (category: LogEntry['category']) => {
    const icons = {
      auth: <Shield className="h-4 w-4" />,
      asset: <Database className="h-4 w-4" />,
      user: <User className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />
    };
    return icons[category];
  };

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warning').length,
    today: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length
  };

  const exportLogs = () => {
    // Implement CSV export functionality
    console.log('Exporting logs...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor system activities, user actions, and security events
          </p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Logs</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="security">Security Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>
                Real-time monitoring of system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <DatePicker 
                    date={startDate} 
                    setDate={setStartDate}
                    placeholder="Start date"
                  />
                  <DatePicker 
                    date={endDate} 
                    setDate={setEndDate}
                    placeholder="End date"
                  />
                </div>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="asset">Assets</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logs Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="capitalize">{log.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="text-sm">{log.user}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {log.details}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Monitor security-related events and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.filter(log => log.category === 'security' || log.level === 'error').map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border p-4">
                    <div className="mt-1">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.action}</span>
                        {getLevelBadge(log.level)}
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>User: {log.user}</span>
                        <span>Time: {log.timestamp}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete audit trail of all system modifications and access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.filter(log => ['user', 'asset'].includes(log.category)).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border p-4">
                    <div className="mt-1">
                      {getCategoryIcon(log.category)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.action}</span>
                        <Badge variant="outline" className="capitalize">{log.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Performed by: {log.user}</span>
                        <span>Time: {log.timestamp}</span>
                        {log.ipAddress && <span>From: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
