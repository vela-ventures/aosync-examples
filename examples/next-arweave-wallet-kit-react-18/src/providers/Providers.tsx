"use client";

import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import WanderStrategy from "@arweave-wallet-kit/wander-strategy";
import BeaconWallet from "@vela-ventures/aosync-strategy";
// import { AOSyncProvider } from "@vela-ventures/aosync-sdk-react";
import React, { ReactNode } from "react";

export const ContextProviders = ({ children }: { children: ReactNode }) => {
  return (
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
          new BeaconWallet()
        ],
      }}
    >
      {children}
    </ArweaveWalletKit>
  );
};
