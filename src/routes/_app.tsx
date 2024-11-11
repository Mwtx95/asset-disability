import * as React from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  pendingComponent: DashboardLayout,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
