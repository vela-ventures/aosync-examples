import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import WanderStrategy from "@arweave-wallet-kit/wander-strategy";
import AoSyncStrategy from "@vela-ventures/aosync-strategy";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_PUBLIC_KEY",
          "SIGN_TRANSACTION",
          "DISPATCH",
        ],
        ensurePermissions: true,
        strategies: [
          new WanderStrategy(),
          new AoSyncStrategy()
        ],
      }}
    >
      <App />
    </ArweaveWalletKit>
  </StrictMode>
);
