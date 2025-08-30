"use client";
import { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";
import { getSBTContract, checkNetwork } from "../utils/sbtContract";
import { switchToFuji } from "../utils/networkSwitch";
import MilestoneForm from "../components/MilestoneForm"; // Import the milestone component

export default function Home() {
  const { address, connectWallet, signer } = useWallet();
  const [hasSBT, setHasSBT] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const [networkError, setNetworkError] = useState(false);
  const [activeTab, setActiveTab] = useState("verification"); // New state for tabs

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
      const networkOk = await checkNetwork(signer);
      if (!networkOk) {
        addDebugLog("Wrong network detected - need Avalanche Fuji (43113)");
        setNetworkError(true);
        setLoading(false);
        return;
      }
      addDebugLog("Network check passed");
      setNetworkError(false);
      
      addDebugLog(`Contract address: ${process.env.NEXT_PUBLIC_SBT_ADDRESS}`);
      addDebugLog(`RPC URL: ${process.env.NEXT_PUBLIC_RPC_URL}`);
      
      const sbt = getSBTContract(signer);
      addDebugLog("Contract instance created");
      
      try {
        const contractName = await sbt.name();
        addDebugLog(`Contract name: ${contractName}`);
      } catch (nameError) {
        addDebugLog(`Error getting contract name: ${nameError.message}`);
        addDebugLog("This suggests contract not found at address or wrong network");
        return;
      }
      
      const id = await sbt.tokenOf(address);
      addDebugLog(`tokenOf result: ${id.toString()} (type: ${typeof id})`);
      
      if (id.toString() !== "0") {
        addDebugLog(`Found SBT with Token ID: ${id}`);
        
        const isValid = await sbt.isValid(id);
        addDebugLog(`Token is valid: ${isValid}`);
        
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
      <h1>🚀 CampusFounders Web3 Platform</h1>
      
      {!address ? (
        <div>
          <p>Connect your wallet to access the platform</p>
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
          
          {/* Tab Navigation */}
          <div style={{
            display: "flex",
            marginTop: "1rem",
            marginBottom: "2rem",
            borderBottom: "2px solid #eee"
          }}>
            <button
              onClick={() => setActiveTab("verification")}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                backgroundColor: "transparent",
                borderBottom: activeTab === "verification" ? "2px solid #0070f3" : "none",
                color: activeTab === "verification" ? "#0070f3" : "#666",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              🏅 Investor Verification
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                backgroundColor: "transparent",
                borderBottom: activeTab === "milestones" ? "2px solid #0070f3" : "none",
                color: activeTab === "milestones" ? "#0070f3" : "#666",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              🏆 Milestone Verification
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "verification" && (
            <div>
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
                  <p>You can now access verified investor features and milestone verification.</p>
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
            </div>
          )}

          {activeTab === "milestones" && (
            <div>
              {networkError ? (
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "5px",
                  textAlign: "center"
                }}>
                  <p>Please switch to Avalanche Fuji network to use milestone verification</p>
                  <button 
                    onClick={handleNetworkSwitch}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    Switch Network
                  </button>
                </div>
              ) : (
                <MilestoneForm signer={signer} address={address} />
              )}
            </div>
          )}
          
          {/* Debug Information - Only show on verification tab */}
          {activeTab === "verification" && (
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
          )}
        </div>
      )}
    </div>
  );
}