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
    getAllAddresses,
    getWalletNames,
    userTokens,
  } = useWallet();
  const handleConnect = async () => {
    await connect();
    console.log(await window.arweaveWallet.getActiveAddress());
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
        <img
          src="https://arweave.net/j6XByc7Z1bKa3SytVcr-Ifykecvc5EQnXmh-HeXD428"
          alt="QR Code"
          style={{ width: "100px" }}
        ></img>
      </div>
      <h1>Vite + React</h1>
      <div
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        {isConnected ? (
          <button onClick={disconnect}>Disconnect Beacon</button>
        ) : (
          <button onClick={handleConnect}>Connect Beacon</button>
        )}
        <button
          onClick={() =>
            signAOMessage({
              target: "VZrWgY1-QYerRHsnVW-NtDYw3InDI2YHJbZtpdzM1HI",
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

        <button
          onClick={async () => {
            console.log(await getAllAddresses());
            console.log(await getWalletNames());
            console.log(await userTokens());
          }}
        >
          get user info
        </button>
        <div>
          <h3>Counter</h3>
          <Counter />
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
