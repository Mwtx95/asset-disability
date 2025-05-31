import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import axios from 'axios';

type RouteContext = {
  isAuthenticated: boolean;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouteContext>()({
  beforeLoad: ({ context: { isAuthenticated }, location }) => {
    const rootPage = location.pathname === '/';
    const isLoginPage = location.pathname === '/login';

    // If user is not authenticated
    if (!isAuthenticated) {
      // Allow access to login page
      if (isLoginPage) return;
      // Redirect all other pages to login
      throw redirect({ to: '/login' });
    }

    // If user is authenticated
    if (isAuthenticated) {
      // Redirect login page to dashboard if already authenticated
      if (isLoginPage) throw redirect({ to: '/dashboard' });
      // Redirect root page to dashboard if already authenticated
      if (rootPage) throw redirect({ to: '/dashboard' });
    }
  },
  component: Outlet,
});
