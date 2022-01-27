import { Icon, IconButton } from "@mui/material";
import { ProviderContext, SnackbarKey, SnackbarProvider } from "notistack";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export function Root() {
  const snackbarContextRef = React.createRef<ProviderContext>();

  function createOnClose(key: SnackbarKey) {
    return () => {
      if (snackbarContextRef.current) {
        snackbarContextRef.current.closeSnackbar(key);
      }
    };
  }

  return (
    <BrowserRouter>
      <SnackbarProvider
        ref={snackbarContextRef as any}
        action={(key) => (
          <IconButton
            onClick={createOnClose(key)}
            sx={{
              color: "inherit",
              transform: "scale(0.7)",
              transition: "opacity 200ms",
              opacity: 0.7,
              ":hover": { opacity: 0.9 },
            }}
          >
            <Icon>close</Icon>
          </IconButton>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}
