import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import axios from "axios";
import ReactDOM from "react-dom/client";
import "./main.css";
import { routeTree } from "./routeTree.gen";
import useAuthStore from "./stores/auth";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  // defaultPendingComponent: ,
  context: { isAuthenticated: undefined!, queryClient },
  defaultPreloadStaleTime: 0,
});

axios.defaults.baseURL = "http://localhost:8000/api";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

function App() {
  const { user } = useAuthStore();
  const isAuthenticated = !!user?.token;

  // Set axios authorization header if user is authenticated
  if (user?.token) {
    axios.defaults.headers.common['Authorization'] = `Token ${user.token}`;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{ isAuthenticated, queryClient }}
      />
    </QueryClientProvider>
  );
}
