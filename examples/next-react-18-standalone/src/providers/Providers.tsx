"use client";

import dynamic from "next/dynamic";
const AOSyncProvider = dynamic(
    () =>
      import("@vela-ventures/aosync-sdk-react").then(
        (module) => module.AOSyncProvider
      ),
    { ssr: false }
  );
// import { AOSyncProvider } from "@vela-ventures/aosync-sdk-react";
import React, { ReactNode } from "react";

export const ContextProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AOSyncProvider
      gatewayConfig={{
        host: "arweave.net",
        port: 443,
        protocol: "https",
      }}
      appInfo={{ name: "Next 19 standalone" }}
      muUrl="https://mu.ao-testnet.xyz"
    >
      {children}
    </AOSyncProvider>
  );
};
