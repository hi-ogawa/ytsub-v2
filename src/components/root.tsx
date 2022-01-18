import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { ProviderContext, SnackbarKey, SnackbarProvider } from "notistack";
import { IconButton, Icon } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";

import { App } from "./app";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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
        </QueryClientProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}
