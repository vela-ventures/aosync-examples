import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useWallet } from "@vela-ventures/aosync-sdk-react";
import { createDataItemSigner, message } from "@permaweb/aoconnect";
import Counter from "./counter";

function App() {
  const [count, setCount] = useState(0);
  const {
    isConnected,
    connect,
    disconnect,
    signAOMessage,
    getAddress,
    getAllAddresses,
    getWalletNames,
    userTokens,
    getContacts,
    getWallets,
    isSessionActive,
  } = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const handleConnect = async () => {
    await connect();
    console.log(await window.arweaveWallet.getActiveAddress());
    setAddress((await getAddress()) || null);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <p>Address: {address}</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button
          onClick={async () => {
            setAddress((await getAddress()) || null);
            console.log(await getAddress());
          }}
        >
          Get Address
        </button>
        {isConnected ? (
          <button onClick={disconnect}>Disconnect Beacon</button>
        ) : (
          <button onClick={handleConnect}>Connect Beacon</button>
        )}
        <button
          onClick={() =>
            signAOMessage({
              target: "BZrWgY1-QYerRHsnVW-NtDYw3InDI2YHJbZtpdzM1HI",
              tags: [{ name: "Action", value: "Info" }],
              data: "somedata",
            })
          }
        >
          signAOMessage
        </button>
        <button
          onClick={async () => {
            const messageId = await message({
              process: "VZrWgY1-QYerRHsnVW-NtDYw3InDI2YHJbZtpdzM1HI",
              tags: [
                {
                  name: "Action",
                  value: "IncreaseCounter",
                },
              ],
              data: "",
              signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(messageId);
          }}
        >
          send message with createDataItemSigner
        </button>
        <button
          onClick={async () => {
            const messageId = await message({
              process: "VZrWgY1-QYerRHsnVW-NtDYw3InDI2YHJbZtpdzM1HI",
              tags: [
                {
                  name: "Action",
                  value: "Transfer",
                },
              ],
              data: "",
              signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(messageId);
          }}
        >
          fake tx
        </button>
        <button
          onClick={() =>
            signAOMessage({
              target: "VZrWgY1-QYerRHsnVW-NtDYw3InDI2YHJbZtpdzM1HI",
              tags: [{ name: "Action", value: "Transfer" }],
              data: "somedata",
            })
          }
        >
          fake tx (sdk)
        </button>
        <div>
          <h3>Counter</h3>
          <Counter />
        </div>
      </div>
      <div>
        <h3>Address</h3>
        <button onClick={async () => console.log(await getAddress())}>
          Get Address
        </button>
        <h3>All Addresses</h3>
        <button onClick={async () => console.log(await getAllAddresses())}>
          Get All Addresses
        </button>
        <h3>Wallet Names</h3>
        <button onClick={async () => console.log(await getWalletNames())}>
          Get Wallet Names
        </button>
        <h3>User Tokens</h3>
        <button onClick={async () => console.log(await userTokens())}>
          Get User Tokens
        </button>
        <h3>Contacts</h3>
        <button onClick={async () => console.log(await getContacts())}>
          Get Contacts
        </button>
        <h3>Wallets</h3>
        <button onClick={async () => console.log(await getWallets())}>
          Get Wallets
        </button>
        <h3>Session Active</h3>
        <div style={{ color: isSessionActive ? "green" : "red" }}>
          {isSessionActive ? "Active" : "Inactive"}
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
