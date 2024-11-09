import { createRootRoute, Outlet } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </QueryClientProvider>
  ),
})
