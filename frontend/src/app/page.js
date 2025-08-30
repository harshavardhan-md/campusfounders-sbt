"use client";
import { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";
import { getSBTContract, checkNetwork } from "../utils/sbtContract";
import { switchToFuji } from "../utils/networkSwitch";

export default function Home() {
  const { address, connectWallet, signer } = useWallet();
  const [hasSBT, setHasSBT] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);

  const [networkError, setNetworkError] = useState(false);

  const addDebugLog = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleNetworkSwitch = async () => {
    addDebugLog("Attempting to switch to Avalanche Fuji...");
    const success = await switchToFuji();
    if (success) {
      addDebugLog("✅ Network switched successfully");
      setNetworkError(false);
      // Wait a moment then check SBT
      setTimeout(() => checkSBT(), 1000);
    } else {
      addDebugLog("❌ Failed to switch network");
    }
  };

  const checkSBT = async () => {
    if (!signer || !address) {
      addDebugLog("No signer or address available");
      return;
    }
    
    setLoading(true);
    addDebugLog(`Starting SBT check for address: ${address}`);
    
    try {
      // Check network first
      const networkOk = await checkNetwork(signer);
      if (!networkOk) {
        addDebugLog("Wrong network detected - need Avalanche Fuji (43113)");
        setNetworkError(true);
        setLoading(false);
        return;
      }
      addDebugLog("Network check passed");
      setNetworkError(false);
      
      // Log contract details
      addDebugLog(`Contract address: ${process.env.NEXT_PUBLIC_SBT_ADDRESS}`);
      addDebugLog(`RPC URL: ${process.env.NEXT_PUBLIC_RPC_URL}`);
      
      const sbt = getSBTContract(signer);
      addDebugLog("Contract instance created");
      
      // Test basic contract connectivity
      try {
        const contractName = await sbt.name();
        addDebugLog(`Contract name: ${contractName}`);
      } catch (nameError) {
        addDebugLog(`Error getting contract name: ${nameError.message}`);
        addDebugLog("This suggests contract not found at address or wrong network");
        return;
      }
      
      // Check token ID
      const id = await sbt.tokenOf(address);
      addDebugLog(`tokenOf result: ${id.toString()} (type: ${typeof id})`);
      
      if (id.toString() !== "0") {
        addDebugLog(`Found SBT with Token ID: ${id}`);
        
        // Check if valid
        const isValid = await sbt.isValid(id);
        addDebugLog(`Token is valid: ${isValid}`);
        
        // Check verified status
        const isVerified = await sbt.isVerifiedInvestor(address);
        addDebugLog(`Is verified investor: ${isVerified}`);
        
        if (isValid && isVerified) {
          setHasSBT(true);
          setTokenId(id.toString());
          addDebugLog("✅ Successfully detected valid SBT");
        } else {
          addDebugLog("❌ SBT exists but is invalid or revoked");
        }
      } else {
        addDebugLog("❌ No SBT found for this address");
        setHasSBT(false);
        setTokenId(null);
      }
      
    } catch (error) {
      addDebugLog(`❌ Error in checkSBT: ${error.message}`);
      console.error("Full error:", error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (signer && address) {
      addDebugLog("Wallet connected, checking SBT status");
      checkSBT();
    }
  }, [signer, address]);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>CampusFounders Investor Verification</h1>
      
      {!address ? (
        <div>
          <p>Connect your wallet to check your investor verification status</p>
          <button 
            onClick={connectWallet}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <p><strong>Connected Wallet:</strong> {address}</p>
          
          {loading ? (
            <p>Loading...</p>
          ) : networkError ? (
            <div style={{
              padding: "1rem",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "5px",
              marginTop: "1rem"
            }}>
              <h2>Wrong Network Detected</h2>
              <p>You're connected to Avalanche Mainnet (43114) but need Fuji testnet (43113)</p>
              
              <div style={{ marginTop: "1rem" }}>
                <button 
                  onClick={handleNetworkSwitch}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    marginRight: "1rem"
                  }}
                >
                  Auto Switch to Fuji
                </button>
                
                <details style={{ marginTop: "1rem" }}>
                  <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Manual Instructions</summary>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                    <p>If auto-switch doesn't work:</p>
                    <ol>
                      <li>Open MetaMask</li>
                      <li>Click network dropdown at top</li>
                      <li>Click "Add network" or "Add a network manually"</li>
                      <li>Enter these details:</li>
                      <ul>
                        <li><strong>Network name:</strong> Avalanche Fuji C-Chain</li>
                        <li><strong>RPC URL:</strong> https://api.avax-test.network/ext/bc/C/rpc</li>
                        <li><strong>Chain ID:</strong> 43113</li>
                        <li><strong>Currency symbol:</strong> AVAX</li>
                        <li><strong>Explorer:</strong> https://testnet.snowtrace.io</li>
                      </ul>
                      <li>Save and switch to this network</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </details>
              </div>
            </div>
          ) : hasSBT ? (
            <div style={{
              padding: "1rem",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "5px",
              marginTop: "1rem"
            }}>
              <h2>✅ Verified Investor!</h2>
              <p><strong>Token ID:</strong> {tokenId}</p>
            </div>
          ) : (
            <div style={{
              padding: "1rem",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "5px",
              marginTop: "1rem"
            }}>
              <h2>❌ No Investor Verification Found</h2>
              <p>You don't have a verified investor SBT yet.</p>
            </div>
          )}
          
          <button 
            onClick={checkSBT}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            Refresh Status
          </button>
          
          {/* Debug Information */}
          <div style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            fontSize: "0.9rem"
          }}>
            <h3>Debug Log:</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {debugInfo.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}