import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AOSyncProvider } from "@vela-ventures/aosync-sdk-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AOSyncProvider
      gatewayConfig={{
        host: "arweave.net",
        port: 443,
        protocol: "https",
      }}
      appInfo={{ name: "App name" }}
      muUrl="https://mu.ao-testnet.xyz"
    >
      <App />
    </AOSyncProvider>
  </StrictMode>
);
