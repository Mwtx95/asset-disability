import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardNav } from "./dashboard-nav"
import { MenuIcon } from "lucide-react"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white px-4 dark:bg-gray-950">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <div className="flex w-[15rem] h-full justify-center items-center">
          <img src="/img/dda.png" alt="DDA Logo" className="size-10" />
        </div>
          <h1 className="hidden text-lg font-semibold md:block">
            ZANZIBAR NATIONAL DISABILITY COUNCIL
          </h1>
      </header>

      <div className="flex-1 items-start">
        <div className="grid lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className={cn(
            "fixed left-0 z-40 h-full w-64 transform border-r bg-white transition-transform dark:bg-gray-950",
            "md:static md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <DashboardNav />
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 