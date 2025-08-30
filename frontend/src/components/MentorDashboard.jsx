"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const safeMilestoneType = (milestoneType) => {
  if (!milestoneType || typeof milestoneType !== 'string') {
    return 'Unknown';
  }
  return milestoneType.charAt(0).toUpperCase() + milestoneType.slice(1);
};

// Same ABI as in MilestoneForm
const MILESTONE_ABI = [
  "function submitMilestone(string _startupId, string _milestoneType, uint256 _value, string _description, string _proofHash) returns (uint256)",
  "function verifyMilestone(string _startupId, uint256 _milestoneIndex)",
  "function getStartupMilestones(string _startupId) view returns (tuple(string startupId, string milestoneType, uint256 value, string description, address mentorAddress, string proofHash, uint256 timestamp, bool verified)[])",
  "function addMentor(address _mentorAddress)",
  "function assignMentor(string _startupId, address _mentorAddress)"
];

export default function MentorDashboard({ signer, address }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [verifyingMilestone, setVerifyingMilestone] = useState(null);

  // Test startup IDs that have mentors assigned
  const testStartupIds = [
    "campus-founders-001",
    "learny-hive-001", 
    "startup-alpha-001"
  ];

  const loadMilestones = async () => {
    if (!signer) return;
    
    setLoading(true);
    setResult("Loading milestones...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      let allMilestones = [];
      
      // Check each startup for milestones
      for (const startupId of testStartupIds) {
        try {
          const startupMilestones = await contract.getStartupMilestones(startupId);
          
          // Convert and filter milestones assigned to current mentor
          for (let i = 0; i < startupMilestones.length; i++) {
            const milestone = startupMilestones[i];
            
            // Only show milestones where current user is the assigned mentor
            if (milestone.mentorAddress.toLowerCase() === address.toLowerCase()) {
              allMilestones.push({
                ...milestone,
                startupId: startupId,
                milestoneIndex: i,
                formattedTime: new Date(Number(milestone.timestamp) * 1000).toLocaleString()
              });
            }
          }
        } catch (error) {
          console.log(`No milestones found for ${startupId}`);
        }
      }
      
      setMilestones(allMilestones);
      setResult(allMilestones.length > 0 ? 
        `Found ${allMilestones.length} milestone(s) for review` : 
        "No milestones assigned to you yet"
      );
      
    } catch (error) {
      console.error("Error loading milestones:", error);
      setResult(`Error loading milestones: ${error.message}`);
    }
    
    setLoading(false);
  };

  const verifyMilestone = async (startupId, milestoneIndex) => {
    if (!signer) return;
    
    setVerifyingMilestone(`${startupId}-${milestoneIndex}`);
    setResult("Verifying milestone...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      // First check if milestone is already verified
      const currentMilestones = await contract.getStartupMilestones(startupId);
      if (currentMilestones[milestoneIndex] && currentMilestones[milestoneIndex].verified) {
        setResult("This milestone is already verified!");
        setVerifyingMilestone(null);
        return;
      }

      // Call verify function
      const tx = await contract.verifyMilestone(startupId, milestoneIndex);
      
      setResult("Transaction submitted, waiting for confirmation...");
      
      const receipt = await tx.wait();
      
      setResult(`Milestone verified successfully! 
                 Transaction: ${receipt.hash}
                 View on Explorer: https://testnet.snowtrace.io/tx/${receipt.hash}`);

      // Also update the specific milestone in state immediately for better UX
      setMilestones(prev => prev.map(m => 
        m.startupId === startupId && m.milestoneIndex === milestoneIndex 
          ? { ...m, verified: true }
          : m
      ));

      // Reload milestones to show updated status with longer delay and manual refresh
      setTimeout(() => {
        console.log("Auto-refreshing milestones after verification...");
        loadMilestones();
      }, 3000);

    } catch (error) {
      console.error("Error verifying milestone:", error);
      
      // Better error handling for common cases
      if (error.message.includes("missing revert data")) {
        setResult(`Milestone might already be verified, or there was a blockchain connectivity issue. 
                   Try refreshing the dashboard to see current status.`);
      } else if (error.message.includes("already verified")) {
        setResult("This milestone has already been verified!");
      } else {
        setResult(`Error verifying milestone: ${error.message}`);
      }
    }
    
    setVerifyingMilestone(null);
  };

  useEffect(() => {
    if (signer && address) {
      loadMilestones();
    }
  }, [signer, address]);

  if (!signer) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Please connect your wallet to access mentor dashboard</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Mentor Dashboard</h2>
        <button
          onClick={loadMilestones}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <p><strong>Mentor Address:</strong> {address}</p>

      {result && (
        <div style={{
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: result.includes("Error") ? "#ffebee" : result.includes("successfully") ? "#e8f5e8" : "#fff3cd",
          border: `1px solid ${result.includes("Error") ? "#f44336" : result.includes("successfully") ? "#4caf50" : "#ffc107"}`,
          borderRadius: "4px",
          whiteSpace: "pre-line",
          fontSize: "0.9rem"
        }}>
          {result}
        </div>
      )}

      {milestones.length === 0 && !loading ? (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          color: "#666"
        }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>No milestones to review</p>
          <p>Milestones submitted by startups will appear here for verification</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {milestones.map((milestone, index) => (
            <div
              key={index}
              style={{
                border: milestone.verified ? "2px solid #4caf50" : "2px solid #ff9800",
                borderRadius: "8px",
                padding: "1.5rem",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
              }}>
                <div>
                  <h3 style={{ margin: "0 0 0.25rem 0", color: "#333" }}>
                    {milestone.startupId}
                  </h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                    {safeMilestoneType(milestone.milestoneType)} Milestone
                  </p>
                </div>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  backgroundColor: milestone.verified ? "#4caf50" : "#ff9800",
                  color: "white"
                }}>
                  {milestone.verified ? "VERIFIED" : "PENDING"}
                </span>
              </div>

              {/* Content */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem"
              }}>
                <div>
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "#888" }}>VALUE</p>
                  <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>
                    {milestone.milestoneType === "funding" || milestone.milestoneType === "revenue" 
                      ? `$${Number(milestone.value || 0).toLocaleString()}` 
                      : Number(milestone.value || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "#888" }}>SUBMITTED</p>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>{milestone.formattedTime}</p>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#888" }}>DESCRIPTION</p>
                <p style={{ margin: 0, color: "#333" }}>{milestone.description || 'No description provided'}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#888" }}>PROOF HASH</p>
                <p style={{ 
                  margin: 0, 
                  fontSize: "0.8rem", 
                  fontFamily: "monospace", 
                  color: "#666",
                  wordBreak: "break-all"
                }}>
                  {milestone.proofHash || 'No proof hash'}
                </p>
              </div>

              {/* Verification Button */}
              {!milestone.verified && (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => verifyMilestone(milestone.startupId, milestone.milestoneIndex)}
                    disabled={verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}`}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}` ? "#cccccc" : "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}` ? "not-allowed" : "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "bold"
                    }}
                  >
                    {verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}` ? "Verifying..." : "Verify Milestone"}
                  </button>
                  <button
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem"
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {milestone.verified && (
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "#e8f5e8",
                  borderRadius: "4px",
                  color: "#2e7d2e",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}>
                  This milestone is permanently verified on Avalanche blockchain
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}