import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardNav } from './dashboard-nav';
import { MenuIcon, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/stores/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const getUserRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'branch_admin':
        return 'Branch Admin';
      case 'staff':
        return 'Staff';
      default:
        return role;
    }
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 flex h-16 items-center justify-between border-b px-4 pl-0 dark:bg-gray-950 shadow bg-gradient-to-r from-yellow-50 to-green-100'>
        <div className='flex items-center'>
          <div className='h-full w-64 border-r flex items-center gap-8 border-gray-100 bg-gradient-to-r from-green-400 via-lime-500 to-yellow-500 shadow-lg shadow-green-900/20'>
            <Button
              variant='link'
              size='icon'
              className='lg:hidden text-white hover:text-green-100 ml-2'
              onClick={() => setIsOpen(!isOpen)}
            >
              <MenuIcon className='size-5' />
            </Button>
            <div className='flex lg:w-[15rem] lg:h-full justify-center items-center'>
              <img src='/img/dda.png' alt='DDA Logo' className='size-12' />
              <h1 className='text-lg font-medium ml-4'>NCPWD</h1>
            </div>
          </div>
          <h1 className='max-lg:hidden text-lg font-semibold ml-4'>
            ZANZIBAR NATIONAL DISABILITY COUNCIL
          </h1>
        </div>

        {/* User Avatar and Dropdown */}
        <div className='flex items-center gap-4 mr-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-10 w-auto rounded-full px-3 hover:bg-green-50'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8 bg-gradient-to-r from-green-400 to-lime-500'>
                    <AvatarFallback className='bg-gradient-to-r from-green-400 to-lime-500 text-white font-semibold text-sm'>
                      {user ? getUserInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='hidden md:flex flex-col items-start'>
                    <span className='text-sm font-medium'>{user?.username}</span>
                    <span className='text-xs text-muted-foreground'>
                      {user ? getUserRoleDisplay(user.role) : 'User'}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>{user?.username}</p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user?.email}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user ? getUserRoleDisplay(user.role) : 'User'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer'>
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Settings className='mr-2 h-4 w-4' />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className='cursor-pointer text-red-600 focus:text-red-600'
                onClick={handleLogout}
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className='flex-1 items-start'>
        <div className='grid lg:grid-cols-[250px_1fr]'>
          <aside
            className={cn(
              'fixed shadow left-0 z-40 h-full w-64 transform border-r bg-white transition-transform dark:bg-gray-950',
              'lg:static lg:translate-x-0',
              isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <ScrollArea className='h-[calc(100vh-4rem)]'>
              <DashboardNav />
            </ScrollArea>
          </aside>
          <main className='flex-1 overflow-y-auto p-6 bg-slate-50'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
