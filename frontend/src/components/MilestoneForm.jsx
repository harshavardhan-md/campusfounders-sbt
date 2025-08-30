"use client";
import { useState } from "react";
import { ethers } from "ethers";

// Milestone contract ABI (simplified)
const MILESTONE_ABI = [
  "function submitMilestone(string _startupId, string _milestoneType, uint256 _value, string _description, string _proofHash) returns (uint256)",
  "function verifyMilestone(string _startupId, uint256 _milestoneIndex)",
  "function getStartupMilestones(string _startupId) view returns (tuple(string startupId, string milestoneType, uint256 value, string description, address mentorAddress, string proofHash, uint256 timestamp, bool verified)[])",
  "function addMentor(address _mentorAddress)",
  "function assignMentor(string _startupId, address _mentorAddress)"
];

export default function MilestoneForm({ signer, address }) {
  const [milestone, setMilestone] = useState({
    startupId: "campus-founders-001", // Default startup ID
    type: "",
    value: "",
    description: "",
    proofText: "" // Simplified - just text instead of file upload
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const milestoneTypes = [
    { value: "funding", label: "💰 Funding Round" },
    { value: "revenue", label: "💵 Revenue Milestone" },
    { value: "users", label: "👥 User Growth" },
    { value: "product_launch", label: "🚀 Product Launch" }
  ];

  const submitMilestone = async (e) => {
    e.preventDefault();
    if (!signer) {
      setResult("❌ Please connect your wallet first");
      return;
    }

    setLoading(true);
    setResult("📤 Submitting milestone...");

    try {
      // Create contract instance
      const contract = new ethers.Contract(
        "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395",
        MILESTONE_ABI,
        signer
      );

      // For demo, we'll use the description as the "proof hash"
      const proofHash = `proof_${Date.now()}_${milestone.type}`;

      // Submit milestone
      const tx = await contract.submitMilestone(
        milestone.startupId,
        milestone.type,
        milestone.value,
        milestone.description,
        proofHash
      );

      setResult("⏳ Transaction submitted, waiting for confirmation...");
      
      const receipt = await tx.wait();
      
      setResult(`✅ Milestone submitted successfully! 
                 📄 Transaction: ${receipt.hash}
                 🔗 View on Explorer: https://testnet.snowtrace.io/tx/${receipt.hash}`);

      // Reset form
      setMilestone({
        startupId: "campus-founders-001",
        type: "",
        value: "",
        description: "",
        proofText: ""
      });

    } catch (error) {
      console.error("Error submitting milestone:", error);
      setResult(`❌ Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9"
    }}>
      <h2>🏆 Submit Milestone for Verification</h2>
      
      <form onSubmit={submitMilestone}>
        {/* Startup ID */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Startup ID:
          </label>
          <input
            type="text"
            value={milestone.startupId}
            onChange={(e) => setMilestone({...milestone, startupId: e.target.value})}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
            placeholder="e.g., campus-founders-001"
            required
          />
        </div>

        {/* Milestone Type */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Milestone Type:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {milestoneTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setMilestone({...milestone, type: type.value})}
                style={{
                  padding: "0.75rem",
                  border: milestone.type === type.value ? "2px solid #0070f3" : "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: milestone.type === type.value ? "#e6f3ff" : "white",
                  cursor: "pointer"
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Value */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            {milestone.type === "funding" || milestone.type === "revenue" ? "Amount (USD):" : "Value:"}
          </label>
          <input
            type="number"
            value={milestone.value}
            onChange={(e) => setMilestone({...milestone, value: e.target.value})}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
            placeholder={milestone.type === "users" ? "Number of users" : "Enter amount"}
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Description:
          </label>
          <textarea
            value={milestone.description}
            onChange={(e) => setMilestone({...milestone, description: e.target.value})}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minHeight: "80px"
            }}
            placeholder="Describe this milestone achievement..."
            required
          />
        </div>

        {/* Proof (Simplified) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Proof Details:
          </label>
          <textarea
            value={milestone.proofText}
            onChange={(e) => setMilestone({...milestone, proofText: e.target.value})}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minHeight: "60px"
            }}
            placeholder="Describe your proof (e.g., 'Bank statement dated 2024-03-15 showing $100k transfer')"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !milestone.type}
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.1rem",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Submitting..." : "Submit Milestone"}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: result.includes("❌") ? "#ffebee" : "#e8f5e8",
          border: `1px solid ${result.includes("❌") ? "#f44336" : "#4caf50"}`,
          borderRadius: "4px",
          whiteSpace: "pre-line",
          fontSize: "0.9rem"
        }}>
          {result}
        </div>
      )}
    </div>
  );
}