import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Settings,
  Bell,
  Users,
  File,
  Package,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: File,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function DashboardNav() {
  return (
    <nav className='space-y-1 p-4'>
      {navItems.map(item => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors'
          )}
          activeProps={{
            className: 'bg-gray-100 dark:bg-gray-800',
          }}
        >
          <item.icon className='size-4' />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
