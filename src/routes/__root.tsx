import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router';

type RouteContext = {
  isAuthenticated: boolean;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouteContext>()({
  beforeLoad: ({ context: { isAuthenticated }, location }) => {
    const isLoginPage = location.pathname === '/login';

    if (isLoginPage && !isAuthenticated) return;
    if (isLoginPage) throw redirect({ to: '/dashboard' });
    if (!isAuthenticated) throw redirect({ to: '/login' });
  },
  component: Outlet,
});
