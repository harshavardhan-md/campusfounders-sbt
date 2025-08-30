"use client";
import { useState } from "react";
import { ethers } from "ethers";

// Enhanced ABI with additional functions for debugging and mentor management
const MILESTONE_ABI = [
  "function getStartupMilestones(string _startupId) view returns (tuple(string startupId, string milestoneType, uint256 value, string description, address mentorAddress, string proofHash, uint256 timestamp, bool verified)[])",
  "function addMentor(address _mentorAddress)",
  "function assignMentor(string _startupId, address _mentorAddress)",
  "function submitMilestone(string _startupId, string _milestoneType, uint256 _value, string _description, string _proofHash) returns (uint256)",
  "event MilestoneSubmitted(string indexed startupId, uint256 milestoneIndex)",
  "event MilestoneVerified(string indexed startupId, uint256 milestoneIndex, address mentor)",
  "event MentorAdded(address mentor)",
  "event MentorAssigned(string indexed startupId, address mentor)"
];

export default function BlockchainDebugger({ signer, address }) {
  const [debugResult, setDebugResult] = useState("");
  const [testStartupId, setTestStartupId] = useState("campus-founders-001");
  const [loading, setLoading] = useState(false);

  const checkSpecificStartup = async () => {
    if (!signer) return;
    
    setLoading(true);
    setDebugResult("🔄 Checking blockchain data...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      // Get milestones for specific startup
      const milestones = await contract.getStartupMilestones(testStartupId);
      
      setDebugResult(`📊 Results for startup: ${testStartupId}
      
Found ${milestones.length} milestone(s):

${milestones.length === 0 ? "❌ No milestones found for this startup ID" : ""}
${milestones.map((m, i) => `
Milestone ${i}:
- Type: ${m.milestoneType}
- Value: ${m.value.toString()}
- Description: ${m.description}
- Mentor: ${m.mentorAddress}
- Your Address: ${address}
- Mentor Match: ${m.mentorAddress.toLowerCase() === address.toLowerCase() ? "✅ YES" : "❌ NO"}
- Is Zero Address: ${m.mentorAddress === "0x0000000000000000000000000000000000000000" ? "⚠️ YES (No mentor assigned)" : "❌ NO"}
- Verified: ${m.verified ? "✅ YES" : "❌ NO"}
- Submitted: ${new Date(Number(m.timestamp) * 1000).toLocaleString()}
- Proof Hash: ${m.proofHash}
`).join("\n")}

🔍 Debug Info:
- Contract Address: 0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395
- Your Address: ${address}
- Network: Avalanche Fuji

💡 Possible Issues:
1. If mentor is zero address (0x00...), no mentor has been assigned to these milestones
2. If mentor address doesn't match yours, you're not the assigned mentor
3. Check if mentors need to be added to the contract first using addMentor()`);

    } catch (error) {
      console.error("Debug error:", error);
      setDebugResult(`❌ Error checking blockchain: ${error.message}`);
    }
    
    setLoading(false);
  };

  const checkRecentEvents = async () => {
    if (!signer) return;
    
    setLoading(true);
    setDebugResult("🔄 Checking recent events...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      // Get recent events with better parsing
      const milestoneFilter = contract.filters.MilestoneSubmitted();
      const mentorFilter = contract.filters.MentorAssigned();
      
      const [milestoneEvents, mentorEvents] = await Promise.all([
        contract.queryFilter(milestoneFilter, -1000),
        contract.queryFilter(mentorFilter, -1000)
      ]);
      
      setDebugResult(`📡 Recent Blockchain Events (last 1000 blocks):

🎯 MilestoneSubmitted Events (${milestoneEvents.length} found):
${milestoneEvents.length === 0 ? "❌ No recent milestone submissions found" : ""}
${milestoneEvents.map((event, i) => {
  try {
    // Try to decode the event properly
    const decoded = contract.interface.decodeEventLog("MilestoneSubmitted", event.data, event.topics);
    return `
Event ${i + 1}:
- Startup ID: ${decoded.startupId || "Could not decode"}
- Milestone Index: ${decoded.milestoneIndex?.toString() || "Could not decode"}
- Block: ${event.blockNumber}
- Transaction: ${event.transactionHash}
`;
  } catch (e) {
    return `
Event ${i + 1}: (Decode Error)
- Raw Topics: ${event.topics.join(", ")}
- Block: ${event.blockNumber}
- Transaction: ${event.transactionHash}
`;
  }
}).join("")}

👨‍🏫 MentorAssigned Events (${mentorEvents.length} found):
${mentorEvents.length === 0 ? "❌ No mentor assignments found" : ""}
${mentorEvents.map((event, i) => {
  try {
    const decoded = contract.interface.decodeEventLog("MentorAssigned", event.data, event.topics);
    return `
Assignment ${i + 1}:
- Startup ID: ${decoded.startupId || "Could not decode"}
- Mentor: ${decoded.mentor || "Could not decode"}
- Your Address: ${address}
- Is You: ${decoded.mentor?.toLowerCase() === address.toLowerCase() ? "✅ YES" : "❌ NO"}
- Block: ${event.blockNumber}
`;
  } catch (e) {
    return `
Assignment ${i + 1}: (Decode Error)
- Block: ${event.blockNumber}
`;
  }
}).join("")}

🔍 Analysis:
- If no MentorAssigned events exist, mentors haven't been assigned to startups yet
- If MilestoneSubmitted startup IDs are unreadable, there may be a contract issue`);

    } catch (error) {
      console.error("Events error:", error);
      setDebugResult(`❌ Error checking events: ${error.message}`);
    }
    
    setLoading(false);
  };

  const addMyselfAsMentor = async () => {
    if (!signer || !address) return;
    
    setLoading(true);
    setDebugResult("🔄 Adding yourself as a mentor...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      const tx = await contract.addMentor(address);
      setDebugResult("⏳ Transaction submitted, waiting for confirmation...");
      
      const receipt = await tx.wait();
      
      setDebugResult(`✅ Successfully added as mentor!
📄 Transaction: ${receipt.hash}
🔗 View on Explorer: https://testnet.snowtrace.io/tx/${receipt.hash}

🎯 Next step: Assign yourself to a startup using the "Assign Myself" button`);

    } catch (error) {
      console.error("Error adding mentor:", error);
      setDebugResult(`❌ Error adding mentor: ${error.message}

💡 This might be normal if you're already a mentor. Try assigning yourself to a startup instead.`);
    }
    
    setLoading(false);
  };

  const assignMentorToStartup = async () => {
    if (!signer || !address || !testStartupId) return;
    
    setLoading(true);
    setDebugResult("🔄 Assigning mentor to startup...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      const tx = await contract.assignMentor(testStartupId, address);
      setDebugResult("⏳ Transaction submitted, waiting for confirmation...");
      
      const receipt = await tx.wait();
      
      setDebugResult(`✅ Successfully assigned as mentor to ${testStartupId}!
📄 Transaction: ${receipt.hash}
🔗 View on Explorer: https://testnet.snowtrace.io/tx/${receipt.hash}

🎯 Now go back to the Mentor Dashboard and click Refresh!`);

    } catch (error) {
      console.error("Error assigning mentor:", error);
      setDebugResult(`❌ Error assigning mentor: ${error.message}

💡 Make sure you've been added as a mentor first, and that the startup ID is correct.`);
    }
    
    setLoading(false);
  };

  const checkAllKnownStartups = async () => {
    if (!signer) return;
    
    setLoading(true);
    setDebugResult("🔄 Checking all known startups...");
    
    try {
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      const knownStartups = [
        "campus-founders-001",
        "learny-hive-001", 
        "startup-alpha-001",
        // Try some variations in case there's a naming issue
        "CampusFounders",
        "campusfounders", 
        "test-startup-001"
      ];

      let results = `🔍 Checking all known startup IDs:

`;

      for (const startupId of knownStartups) {
        try {
          const milestones = await contract.getStartupMilestones(startupId);
          
          if (milestones.length > 0) {
            results += `
✅ ${startupId}: ${milestones.length} milestone(s)
${milestones.map((m, i) => `   - Milestone ${i}: ${m.milestoneType}, Mentor: ${m.mentorAddress.slice(0,8)}...`).join("\n")}
`;
          } else {
            results += `❌ ${startupId}: No milestones\n`;
          }
        } catch (error) {
          results += `❌ ${startupId}: Error - ${error.message}\n`;
        }
      }

      results += `
🎯 Your Address: ${address}
💡 Look for startups where Mentor matches your address!`;

      setDebugResult(results);

    } catch (error) {
      console.error("Error checking startups:", error);
      setDebugResult(`❌ Error checking startups: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h2>🔍 Enhanced Blockchain Debugger</h2>
      <p>Let's find out what's on the blockchain and fix the mentor dashboard issue.</p>
      
      {/* Quick Actions */}
      <div style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#e8f4f8"
      }}>
        <h3>⚡ Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <button
            onClick={() => {
              setTestStartupId("campus-founders-001");
              setTimeout(checkSpecificStartup, 100);
            }}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Check campus-founders-001
          </button>
          <button
            onClick={checkAllKnownStartups}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Check All Known Startups
          </button>
          <button
            onClick={checkRecentEvents}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Check Recent Events
          </button>
        </div>
        
        {/* Mentor Management Actions */}
        <div style={{ 
          borderTop: "1px solid #ddd", 
          paddingTop: "1rem", 
          display: "flex", 
          gap: "1rem", 
          flexWrap: "wrap" 
        }}>
          <button
            onClick={addMyselfAsMentor}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#fd7e14",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            🎓 Add Myself as Mentor
          </button>
          <button
            onClick={assignMentorToStartup}
            disabled={loading || !testStartupId}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#20c997",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            🤝 Assign Myself to "{testStartupId}"
          </button>
        </div>
      </div>

      {/* Check Specific Startup */}
      <div style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        <h3>🎯 Check Specific Startup</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Startup ID to check:
          </label>
          <input
            type="text"
            value={testStartupId}
            onChange={(e) => setTestStartupId(e.target.value)}
            style={{
              width: "300px",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginRight: "1rem"
            }}
            placeholder="Enter startup ID"
          />
          <button
            onClick={checkSpecificStartup}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Checking..." : "Check This Startup"}
          </button>
        </div>
      </div>

      {/* Results */}
      {debugResult && (
        <div style={{
          padding: "1.5rem",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          whiteSpace: "pre-line",
          fontSize: "0.9rem",
          fontFamily: "monospace"
        }}>
          <h3>🔍 Debug Results:</h3>
          {debugResult}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: "8px"
      }}>
        <h3>📋 Troubleshooting Steps</h3>
        <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>First, click "Check All Known Startups"</strong> to see what data exists</li>
          <li><strong>If milestones exist but mentor is 0x00000...</strong> - Click "Add Myself as Mentor" then "Assign Myself"</li>
          <li><strong>If no milestones exist</strong> - Go submit a milestone first, then come back</li>
          <li><strong>If startup IDs don't match</strong> - Use the correct startup ID in the input field</li>
          <li><strong>After making changes</strong> - Refresh the mentor dashboard to see results</li>
        </ol>
      </div>
    </div>
  );
}