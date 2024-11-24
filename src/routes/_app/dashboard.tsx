import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Package,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CircleDollarSign,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend?: 'up' | 'down';
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
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <div className='h-4 w-4 text-muted-foreground'>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <div className='flex items-center text-xs text-muted-foreground'>
          {trend && (
            <>
              {trend === 'up' ? (
                <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
              ) : (
                <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
              )}
              <span
                className={trend === 'up' ? 'text-green-500' : 'text-red-500'}
              >
                {trendValue}
              </span>
            </>
          )}
          <span className='ml-1'>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentAssetActivity {
  id: string;
  assetName: string;
  action: 'assigned' | 'maintenance' | 'disposed' | 'purchased';
  department: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
}

const mockRecentActivities: RecentAssetActivity[] = [
  {
    id: '1',
    assetName: 'Hearing Aid',
    action: 'assigned',
    department: 'Audio Department',
    date: '2024-03-15',
    status: 'completed',
  },
  {
    id: '2',
    assetName: 'Wheelchair',
    action: 'purchased',
    department: 'Accessibility',
    date: '2024-03-14',
    status: 'pending',
  },
  {
    id: '3',
    assetName: 'Braille Display',
    action: 'maintenance',
    department: 'IT Department',
    date: '2024-03-13',
    status: 'in-progress',
  },
];

const getStatusColor = (status: RecentAssetActivity['status']) => {
  const colors = {
    completed: 'bg-green-500/10 text-green-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
    'in-progress': 'bg-blue-500/10 text-blue-500',
  };
  return colors[status];
};

const getActionBadge = (action: RecentAssetActivity['action']) => {
  const badges = {
    assigned: { label: 'Assigned', variant: 'outline' },
    maintenance: { label: 'Maintenance', variant: 'destructive' },
    disposed: { label: 'Disposed', variant: 'secondary' },
    purchased: { label: 'Purchased', variant: 'default' },
  };
  return badges[action];
};

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardComponent,
});

function DashboardComponent() {
  const [isLoading] = React.useState(false);

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-[100px]' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-[100px]' />
              <Skeleton className='h-4 w-[150px] mt-2' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Assets Dashboard</h2>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Assets'
          value='1,234'
          icon={<Briefcase className='h-4 w-4' />}
          description='across all departments'
          trend='up'
          trendValue='+5.2%'
        />
        <StatCard
          title='Assets Value'
          value='$890,450'
          icon={<CircleDollarSign className='h-4 w-4' />}
          description='total worth'
        />
        <StatCard
          title='Maintenance Due'
          value='45'
          icon={<AlertCircle className='h-4 w-4' />}
          description='items need attention'
          trend='up'
          trendValue='+12.5%'
        />
        <StatCard
          title='Departments'
          value='12'
          icon={<Building2 className='h-4 w-4' />}
          description='using asset system'
        />
      </div>

      {/* Asset Categories Overview */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='col-span-2'>
          <CardHeader>
            <CardTitle>Recent Asset Activities</CardTitle>
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
                {mockRecentActivities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className='font-medium'>
                      {activity.assetName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getActionBadge(activity.action).variant as any}
                      >
                        {getActionBadge(activity.action).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.department}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}
                      >
                        {activity.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(activity.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-accent flex items-center gap-2'>
                <Package className='h-4 w-4' />
                Add New Asset
              </button>
              <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-accent flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                Schedule Maintenance
              </button>
              <button className='w-full text-left px-4 py-2 rounded-lg hover:bg-accent flex items-center gap-2'>
                <AlertCircle className='h-4 w-4' />
                Report Issue
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
