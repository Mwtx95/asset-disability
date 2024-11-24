import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Settings,
  Bell,
  FileText,
  Package,
  ChevronRight,
  ChevronDown,
  FileOutput,
  FileInput,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
  },
  {
    title: 'Reports',
    icon: FileText,
    children: [
      {
        title: 'Issued',
        href: '/reports/issued',
        icon: FileOutput,
      },
      {
        title: 'Received',
        href: '/reports/received',
        icon: FileInput,
      },
    ],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function DashboardNav() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <nav className='space-y-1 p-4'>
      {navItems.map(item => (
        <div key={item.title}>
          {item.href ? (
            <Link
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className='mr-3 h-5 w-5 flex-shrink-0' />
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
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <child.icon className='mr-3 h-5 w-5 flex-shrink-0' />
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
