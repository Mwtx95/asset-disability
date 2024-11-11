import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardNav } from './dashboard-nav';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <header className='sticky top-0 z-50 flex h-16 items-center border-b px-4 pl-0 dark:bg-gray-950 shadow bg-green-50'>
        <div className='h-full w-64 border-r flex items-center gap-8 border-gray-100 bg-gradient-to-r from-green-700 via-lime-600 to-yellow-600 shadow-lg shadow-green-900/20'>
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
      </header>

      <div className='flex-1 items-start'>
        <div className='grid lg:grid-cols-[250px_1fr]'>
          {/* Sidebar */}
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

          {/* Main Content */}
          <main className='flex-1 overflow-y-auto p-6 bg-slate-50'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
