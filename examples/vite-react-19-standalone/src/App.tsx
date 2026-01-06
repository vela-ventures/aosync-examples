import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useWallet } from "@vela-ventures/aosync-sdk-react";
import { createDataItemSigner, message } from "@permaweb/aoconnect";
import Counter from "./counter";
import { ethers } from "ethers";
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Constants
const BASE_CHAIN_ID = 8453;
const BASE_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const SOLANA_RPC = "https://api.devnet.solana.com"; // Using devnet to avoid rate limits
const SOLANA_USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
const TEST_ETH_RECIPIENT = "0xC1C470615b01d828BbE61B09cE4698e68fCAF299"; // Burn address for testing
const TEST_SOL_RECIPIENT = "GYWEvjyUiJWSLN7hkUnBxPRS3DgEa816mDeCGYtpDmaF"; // System program (safe for testing)

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
    // Multi-chain properties
    activeChain,
    supportedChains,
    multiChainAddresses,
    accountType,
    switchChain,
    getMultiChainAddresses,
    // Universal methods
    signMessage,
    signTransaction,
    sendTransaction,
    signTypedData,
  } = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("Hello from AOSync!");
  const [signResult, setSignResult] = useState<string | null>(null);

  const handleConnect = async () => {
    await connect();
    console.log(await window.arweaveWallet.getActiveAddress());
    setAddress((await getAddress()) || null);
  };

  // Base transaction builders
  const buildBaseNativeTransfer = () => {
    return {
      to: TEST_ETH_RECIPIENT,
      value: ethers.parseEther("0.00005").toString(), // 0.0001 ETH
      chainId: BASE_CHAIN_ID,
      gasLimit: 21000,
    };
  };

  const buildBaseUSDCTransfer = () => {
    const ERC20_TRANSFER_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
    ];
    const iface = new ethers.Interface(ERC20_TRANSFER_ABI);
    const data = iface.encodeFunctionData("transfer", [
      TEST_ETH_RECIPIENT,
      ethers.parseUnits("0.01", 6), // 0.01 USDC (6 decimals)
    ]);

    return {
      to: BASE_USDC,
      value: "0",
      data,
      chainId: BASE_CHAIN_ID,
      gasLimit: 65000,
    };
  };

  // Solana transaction builders
  const buildSolanaNativeTransfer = async (fromPubkey: PublicKey) => {
    const connection = new Connection(SOLANA_RPC);
    const toPubkey = new PublicKey(TEST_SOL_RECIPIENT);
    const lamports = 0.0001 * LAMPORTS_PER_SOL; // 0.001 SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Serialize transaction to base64
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const serializedBase64 = Buffer.from(serialized).toString("base64");

    // Return plain object format similar to Base transactions
    return {
      serialized: serializedBase64,
      to: toPubkey.toString(),
      from: fromPubkey.toString(),
      amount: lamports.toString(),
      recentBlockhash: blockhash,
    };
  };

  const buildSolanaUSDCTransfer = async (fromPubkey: PublicKey) => {
    const connection = new Connection(SOLANA_RPC);

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      SOLANA_USDC_MINT,
      fromPubkey
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      SOLANA_USDC_MINT,
      new PublicKey(TEST_SOL_RECIPIENT)
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        10000, // 0.01 USDC (6 decimals)
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Serialize transaction to base64
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const serializedBase64 = Buffer.from(serialized).toString("base64");

    // Return plain object format similar to Base transactions
    return {
      serialized: serializedBase64,
      to: toTokenAccount.toString(),
      from: fromPubkey.toString(),
      amount: "10000", // 0.01 USDC (6 decimals)
      mint: SOLANA_USDC_MINT.toString(),
      recentBlockhash: blockhash,
    };
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

      {/* Multi-Chain Info Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          margin: "20px 0",
          borderRadius: "8px",
        }}
      >
        <h2>🌐 Multi-Chain Info</h2>
        <p>
          <strong>Account Type:</strong> {accountType || "Not connected"}
        </p>
        <p>
          <strong>Active Chain:</strong> {activeChain || "Not connected"}
        </p>
        <p>
          <strong>Supported Chains:</strong>{" "}
          {supportedChains?.length > 0 ? supportedChains.join(", ") : "None"}
        </p>
        {multiChainAddresses && (
          <div>
            <p>
              <strong>Multi-Chain Addresses:</strong>
            </p>
            <ul
              style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}
            >
              {Object.entries(multiChainAddresses).map(([chain, addr]) => (
                <li key={chain}>
                  <strong>{chain}:</strong> {addr}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={async () => {
            const addresses = await getMultiChainAddresses();
            console.log("Multi-chain addresses:", addresses);
          }}
          disabled={!isConnected}
        >
          Fetch All Chain Addresses
        </button>
      </div>

      {/* Chain Switcher Section */}
      {supportedChains?.length > 0 && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            margin: "20px 0",
            borderRadius: "8px",
          }}
        >
          <h2>🔄 Switch Chain</h2>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {supportedChains.map((chain) => (
              <button
                key={chain}
                onClick={() => {
                  switchChain(chain);
                  console.log(`Switched to ${chain}`);
                }}
                disabled={chain === activeChain}
                style={{
                  padding: "10px 20px",
                  backgroundColor:
                    chain === activeChain ? "#4CAF50" : "#008CBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: chain === activeChain ? "not-allowed" : "pointer",
                  opacity: chain === activeChain ? 0.6 : 1,
                }}
              >
                {chain} {chain === activeChain && "✓"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Universal Methods Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          margin: "20px 0",
          borderRadius: "8px",
        }}
      >
        <h2>✍️ Universal Signing Methods</h2>

        <div style={{ marginBottom: "20px" }}>
          <h3>Sign Message (Works on all chains)</h3>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Enter message to sign"
            style={{ width: "300px", padding: "8px", marginRight: "10px" }}
          />
          <button
            onClick={async () => {
              try {
                const signature = await signMessage(messageInput);
                setSignResult(signature);
                console.log("Signature:", signature);
                alert(
                  `Message signed! Signature: ${signature.substring(0, 20)}...`
                );
              } catch (error) {
                console.error("Error signing message:", error);
                alert(
                  `Error: ${
                    error instanceof Error ? error.message : String(error)
                  }`
                );
              }
            }}
            disabled={!isConnected}
          >
            Sign Message
          </button>
          {signResult && (
            <p
              style={{
                fontSize: "12px",
                wordBreak: "break-all",
                maxWidth: "600px",
                margin: "10px auto",
              }}
            >
              <strong>Signature:</strong> {signResult}
            </p>
          )}
        </div>

        {/* Base Chain Transactions */}
        {activeChain === "base" && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Base Chain Transactions</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={async () => {
                  try {
                    const tx = buildBaseNativeTransfer();
                    const signedTx = await signTransaction(tx);
                    console.log("Signed Base ETH transfer:", signedTx);
                    alert("✅ ETH Transfer signed! Check console for details.");
                  } catch (error) {
                    console.error("Error signing Base ETH transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
              >
                Sign ETH Transfer (0.0001 ETH)
              </button>

              <button
                onClick={async () => {
                  try {
                    const tx = buildBaseNativeTransfer();
                    const txHash = await sendTransaction(tx);
                    console.log("Sent Base ETH transfer! TX Hash:", txHash);
                    alert(
                      `✅ Transaction sent!\n\nHash: ${txHash}\n\nView on Basescan:\nhttps://basescan.org/tx/${txHash}`
                    );
                  } catch (error) {
                    console.error("Error sending Base ETH transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
                style={{ backgroundColor: "#f44336" }}
              >
                Send ETH Transfer (0.0001 ETH) ⚠️
              </button>

              <button
                onClick={async () => {
                  try {
                    const tx = buildBaseUSDCTransfer();
                    const signedTx = await signTransaction(tx);
                    console.log("Signed Base USDC transfer:", signedTx);
                    alert(
                      "✅ USDC Transfer signed! Check console for details."
                    );
                  } catch (error) {
                    console.error("Error signing Base USDC transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
              >
                Sign USDC Transfer (0.01 USDC)
              </button>

              <button
                onClick={async () => {
                  try {
                    const tx = buildBaseUSDCTransfer();
                    const txHash = await sendTransaction(tx);
                    console.log("Sent Base USDC transfer! TX Hash:", txHash);
                    alert(
                      `✅ Transaction sent!\n\nHash: ${txHash}\n\nView on Basescan:\nhttps://basescan.org/tx/${txHash}`
                    );
                  } catch (error) {
                    console.error("Error sending Base USDC transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
                style={{ backgroundColor: "#f44336" }}
              >
                Send USDC Transfer (0.01 USDC) ⚠️
              </button>
            </div>
          </div>
        )}

        {/* Solana Chain Transactions */}
        {activeChain === "solana" && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Solana Chain Transactions</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={async () => {
                  try {
                    const addr = await getAddress();
                    if (!addr) throw new Error("No address found");
                    const pubkey = new PublicKey(addr);
                    const tx = await buildSolanaNativeTransfer(pubkey);
                    const signedTx = await signTransaction(tx);
                    console.log("Signed Solana SOL transfer:", signedTx);
                    alert("✅ SOL Transfer signed! Check console for details.");
                  } catch (error) {
                    console.error("Error signing Solana SOL transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
              >
                Sign SOL Transfer (0.001 SOL)
              </button>

              <button
                onClick={async () => {
                  try {
                    const addr = await getAddress();
                    if (!addr) throw new Error("No address found");
                    const pubkey = new PublicKey(addr);
                    const tx = await buildSolanaNativeTransfer(pubkey);
                    const signature = await sendTransaction(tx);
                    console.log(
                      "Sent Solana SOL transfer! Signature:",
                      signature
                    );
                    alert(
                      `✅ Transaction sent!\n\nSignature: ${signature}\n\nView on Solscan:\nhttps://solscan.io/tx/${signature}`
                    );
                  } catch (error) {
                    console.error("Error sending Solana SOL transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
                style={{ backgroundColor: "#f44336" }}
              >
                Send SOL Transfer (0.001 SOL) ⚠️
              </button>

              <button
                onClick={async () => {
                  try {
                    const addr = await getAddress();
                    if (!addr) throw new Error("No address found");
                    const pubkey = new PublicKey(addr);
                    const tx = await buildSolanaUSDCTransfer(pubkey);
                    const signedTx = await signTransaction(tx);
                    console.log("Signed Solana USDC transfer:", signedTx);
                    alert(
                      "✅ USDC Transfer signed! Check console for details."
                    );
                  } catch (error) {
                    console.error("Error signing Solana USDC transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
              >
                Sign USDC Transfer (0.01 USDC)
              </button>

              <button
                onClick={async () => {
                  try {
                    const addr = await getAddress();
                    if (!addr) throw new Error("No address found");
                    const pubkey = new PublicKey(addr);
                    const tx = await buildSolanaUSDCTransfer(pubkey);
                    console.log(tx);
                    const signature = await sendTransaction(tx);
                    console.log(
                      "Sent Solana USDC transfer! Signature:",
                      signature
                    );
                    alert(
                      `✅ Transaction sent!\n\nSignature: ${signature}\n\nView on Solscan:\nhttps://solscan.io/tx/${signature}`
                    );
                  } catch (error) {
                    console.error("Error sending Solana USDC transfer:", error);
                    alert(
                      `Error: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  }
                }}
                disabled={!isConnected}
                style={{ backgroundColor: "#f44336" }}
              >
                Send USDC Transfer (0.01 USDC) ⚠️
              </button>
            </div>
          </div>
        )}

        {/* Ethereum Chain Transactions */}
        {activeChain === "ethereum" && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Ethereum Transactions</h3>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Note: Same format as Base, adjust chainId and contract addresses
              as needed
            </p>
          </div>
        )}

        {(activeChain === "ethereum" || activeChain === "base") && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Sign Typed Data (EIP-712) - EVM Only</h3>
            <button
              onClick={async () => {
                try {
                  const typedData = {
                    domain: {
                      name: "AOSync Test",
                      version: "1",
                      chainId: activeChain === "ethereum" ? 1 : 8453,
                    },
                    types: {
                      Message: [{ name: "content", type: "string" }],
                    },
                    primaryType: "Message",
                    message: {
                      content: "Hello from AOSync!",
                    },
                  };
                  const signature = await signTypedData(typedData);
                  console.log("EIP-712 Signature:", signature);
                  alert(
                    `Typed data signed! Signature: ${signature.substring(
                      0,
                      20
                    )}...`
                  );
                } catch (error) {
                  console.error("Error signing typed data:", error);
                  alert(
                    `Error: ${
                      error instanceof Error ? error.message : String(error)
                    }`
                  );
                }
              }}
              disabled={!isConnected}
            >
              Sign Typed Data (EIP-712)
            </button>
          </div>
        )}
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
