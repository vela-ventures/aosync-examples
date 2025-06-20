import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AOSyncProvider } from "@vela-ventures/aosync-sdk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AOSyncProvider
      gatewayConfig={{
        host: "arweave.net",
        port: 443,
        protocol: "https",
      }}
      appInfo={{ name: "Vite 19 standalone" }}
      muUrl="https://mu.ao-testnet.xyz"
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AOSyncProvider>
  </StrictMode>
);
