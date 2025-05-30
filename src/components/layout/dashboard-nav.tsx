import { cn } from '@/lib/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Settings,
  Bell,
  FileText,
  Package,
  ChevronRight,
  ChevronDown,
  Users,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/stores/auth';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  requiredRole?: 'super_admin' | 'branch_admin' | 'all';
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredRole: 'all',
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
    requiredRole: 'all',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    requiredRole: 'all',
  },
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
    requiredRole: 'super_admin',
  },
  {
    title: 'Logs',
    href: '/logs',
    icon: Activity,
    requiredRole: 'super_admin',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    requiredRole: 'all',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRole: 'all',
  },
];

export function DashboardNav() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { user } = useAuthStore();

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    if (item.requiredRole === 'all') return true;
    if (item.requiredRole === 'super_admin') return user.role === 'super_admin';
    if (item.requiredRole === 'branch_admin') return user.role === 'branch_admin';
    return false;
  });

  return (
    <nav className='space-y-1 p-4'>
      {filteredNavItems.map(item => (
        <div key={item.title}>
          {item.href ? (
            <Link
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive(item.href) ? 'text-green-600' : ''
              )} />
              {item.title}
            </Link>
          ) : (
            <>
              <button
                onClick={() => toggleExpand(item.title)}
                className='flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              >
                <div className='flex items-center'>
                  <item.icon className='mr-3 h-5 w-5 flex-shrink-0' />
                  {item.title}
                </div>
                {expandedItems.includes(item.title) ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </button>
              {item.children && expandedItems.includes(item.title) && (
                <div className='ml-6 space-y-1'>
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      to={child.href!}
                      className={cn(
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive(child.href!)
                          ? 'bg-green-50 text-green-700 border-l-2 border-green-400 ml-2'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <child.icon className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive(child.href!) ? 'text-green-600' : ''
                      )} />
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
