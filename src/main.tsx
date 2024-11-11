import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import './main.css';
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient();

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // defaultPendingComponent: ,
  context: { isAuthenticated: undefined!, queryClient },
  defaultPreloadStaleTime: 0,
});

axios.defaults.baseURL = 'http://127.0.0.1:8081';

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{ isAuthenticated: true, queryClient }}
      />
    </QueryClientProvider>
  );
}
