import React, { useState, useEffect } from 'react';
import { ExternalLink, Users, DollarSign, MapPin, Calendar, Award, Link, Globe } from 'lucide-react';

// Complete startup data from your surveys
const allStartupsData = [
  {
    id: "learny-hive-001",
    name: "LearnyHive",
    funding: "₹45 Lakhs",
    fundingETH: 0.45,
    tags: ["Ed tech", "Innovation"],
    founder: "Bhanush Gowda",
    college: "EPCET Bangalore, 3rd Year",
    color: "#FF5733",
    url: "https://www.learnyhive.com/",
    category: "EdTech"
  },
  {
    id: "waiter-company-001",
    name: "The Waiter Company",
    funding: "₹32 Lakhs",
    fundingETH: 0.32,
    tags: ["FoodTech", "Logistics"],
    founder: "Ishan Purohit",
    college: "RV University, 4th Year",
    color: "#4A90E2",
    url: "https://www.thewaitercompany.in/",
    category: "FoodTech"
  },
  {
    id: "saathi-app-001",
    name: "Saathi App",
    funding: "₹20 Lakhs",
    fundingETH: 0.20,
    tags: ["Innovative", "Social"],
    founder: "Abhay Gupta",
    college: "RV College, Bangalore, 3rd Year",
    color: "#50C878",
    url: "https://www.saathiapp.in/",
    category: "Social"
  },
  {
    id: "kampus-001",
    name: "Kampus",
    funding: "₹50 Lakhs",
    fundingETH: 0.50,
    tags: ["Meets", "Social"],
    founder: "Hemanth Gowda",
    college: "Reva College, Bangalore, 3rd Year",
    color: "#50C878",
    url: "https://www.kampus.social/",
    category: "Social"
  },
  {
    id: "nologin-001",
    name: "NoLogin",
    funding: "₹10 Lakhs",
    fundingETH: 0.10,
    tags: ["Innovative", "Logistics"],
    founder: "Deekshith B",
    college: "BMS College, Bangalore, 3rd Year",
    color: "#50C878",
    url: "https://www.nologin.in/",
    category: "Logistics"
  },
  {
    id: "krewsup-001",
    name: "Krewsup",
    funding: "₹20 Lakhs",
    fundingETH: 0.20,
    tags: ["Innovative", "Health"],
    founder: "S Hari Raghava",
    college: "Reva College, Bangalore, 3rd Year",
    color: "#50C878",
    url: "https://www.Krewsup.com/",
    category: "Health"
  },
  {
    id: "kavastra-001",
    name: "Kavastra",
    funding: "₹12 Lakhs",
    fundingETH: 0.12,
    tags: ["Innovative", "Health"],
    founder: "Shashikant kalal",
    college: "University of Visvesvaraya College of Engineering, Bangalore, 4th Year",
    color: "#50C878",
    url: "http://www.kavastra.com/",
    category: "Health"
  },
  {
    id: "guidero-001",
    name: "Guidero Private Limited",
    funding: "₹12 Lakhs",
    fundingETH: 0.12,
    tags: ["Travel", "Innovative"],
    founder: "C H Sanjana",
    college: "Christ University, 4th Year",
    color: "#50C878",
    url: "www.guidero.in",
    category: "Travel"
  },
  {
    id: "magnus-chocolates-001",
    name: "Magnus Chocolates",
    funding: "₹45 Lakhs",
    fundingETH: 0.45,
    tags: ["Food Tech", "Service"],
    founder: "Mayank Singh",
    college: "NIFT Delhi",
    color: "#FF5733",
    url: "https://www.instagram.com/magnus_chocolates?igsh=aGl2OHR5bzQ2MHNv",
    category: "FoodTech"
  },
  {
    id: "chitva-skincare-001",
    name: "Chitva- A Personalised Skincare Brand",
    funding: "₹32 Lakhs",
    fundingETH: 0.32,
    tags: ["Skincare", "Beauty"],
    founder: "Yerramshetty Suchita",
    college: "MSR University, 4th Year",
    color: "#4A90E2",
    url: "https://www.linkedin.com/in/yerramsetty-sai-venkata-suchita-suchta1234?",
    category: "Beauty"
  },
  {
    id: "start-shape-001",
    name: "Start Shape",
    funding: "₹20 Lakhs",
    fundingETH: 0.20,
    tags: ["Solutions Company", "Creative"],
    founder: "Jesvin Saji",
    college: "Garden City University, Bangalore, 3rd Year",
    color: "#50C878",
    url: "https://www.starshape.in/",
    category: "Creative"
  },
  {
    id: "myniquee-001",
    name: "Myniquee",
    funding: "₹50 Lakhs",
    fundingETH: 0.50,
    tags: ["Creative", "Art"],
    founder: "Vasundhara",
    college: "Reva College, Bangalore, 3rd Year",
    color: "#50C878",
    url: "https://www.instagram.com/myniquee_12?igsh=MXhjdHQ5eTRkZTBrag==",
    category: "Art"
  }
];

// Enhanced ABI with all necessary functions
const MILESTONE_ABI = [
  "function submitMilestone(string _startupId, string _milestoneType, uint256 _value, string _description, string _proofHash) returns (uint256)",
  "function verifyMilestone(string _startupId, uint256 _milestoneIndex)",
  "function getStartupMilestones(string _startupId) view returns (tuple(string startupId, string milestoneType, uint256 value, string description, address mentorAddress, string proofHash, uint256 timestamp, bool verified)[])",
  "function addMentor(address _mentorAddress)",
  "function assignMentor(string _startupId, address _mentorAddress)",
  "function startups(uint256) view returns (address founder, string name, string description, uint256 milestoneCount)",
  "function getMilestone(uint256 startupId, uint256 milestoneIndex) view returns (tuple(string description, uint256 value, address assignedMentor, bool verified, string proofHash, uint256 timestamp))",
  "function getMilestoneCount(uint256 startupId) view returns (uint256)"
];

const EnhancedMentorDashboard = ({ signer, address }) => {
  const [milestones, setMilestones] = useState([]);
  const [milestoneFilter, setMilestoneFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [verifyingMilestone, setVerifyingMilestone] = useState(null);
  const [error, setError] = useState("");

  // Contract address
  const CONTRACT_ADDRESS = "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395";

  // Test startup IDs that have mentors assigned
  const testStartupIds = [
    "campus-founders-001",
    "learny-hive-001", 
    "startup-alpha-001",
    ...allStartupsData.map(s => s.id)
  ];

  const safeMilestoneType = (type) => {
    const typeMap = {
      'users': 'User Acquisition',
      'funding': 'Funding Round',
      'product': 'Product Development',
      'revenue': 'Revenue Milestone'
    };
    return typeMap[type] || type || 'Unknown';
  };

  // Helper function to safely convert BigInt values
  const safeConvertBigInt = (value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  // Helper function to safely parse milestone data
  const processMilestoneData = (milestone, startupId, milestoneIndex) => {
    try {
      const startup = allStartupsData.find(s => s.id === startupId);
      return {
        startupId: startupId,
        milestoneIndex: milestoneIndex,
        description: milestone.description || `Milestone #${milestoneIndex + 1}`,
        milestoneType: milestone.milestoneType || 'general',
        value: safeConvertBigInt(milestone.value || 0),
        mentorAddress: milestone.mentorAddress || milestone.assignedMentor,
        verified: Boolean(milestone.verified),
        rejected: false,
        proofHash: milestone.proofHash || '',
        timestamp: safeConvertBigInt(milestone.timestamp || 0),
        formattedTime: milestone.timestamp ? 
          new Date(Number(safeConvertBigInt(milestone.timestamp)) * 1000).toLocaleString() : 
          'Unknown',
        valueETH: milestone.value ? 
          parseFloat((Number(safeConvertBigInt(milestone.value)) / 1e18).toString()) : 
          0,
        startup: startup // Enriched data
      };
    } catch (error) {
      console.error("Error processing milestone data:", error);
      return null;
    }
  };

  // Mock milestones data for demo (when no blockchain connection)
  const generateMockMilestones = () => {
    if (!address) return [];
    
    return allStartupsData.flatMap(startup => [
      {
        id: `${startup.id}-milestone-1`,
        startupId: startup.id,
        milestoneIndex: 0,
        milestoneType: "users",
        description: `${startup.name} - User Acquisition Milestone`,
        valueETH: startup.fundingETH * 0.2,
        mentorAddress: address,
        proofHash: `QmStartup${startup.id}Milestone0ProofHash`,
        formattedTime: "2025-08-31 10:30 AM",
        verified: false,
        startup: startup
      },
      {
        id: `${startup.id}-milestone-2`,
        startupId: startup.id,
        milestoneIndex: 1,
        milestoneType: "funding",
        description: `${startup.name} - Initial Funding Milestone`,
        valueETH: startup.fundingETH * 0.3,
        mentorAddress: address,
        proofHash: `QmStartup${startup.id}Milestone1ProofHash`,
        formattedTime: "2025-08-30 02:15 PM",
        verified: Math.random() > 0.5,
        startup: startup
      }
    ]);
  };

  // Enhanced milestone loading with proper BigInt handling
  const loadMilestones = async () => {
    if (!signer || !address) {
      // Use mock data if no signer
      const mockMilestones = generateMockMilestones();
      setMilestones(mockMilestones);
      setResult(`Demo mode: Loaded ${mockMilestones.length} mock milestones`);
      return;
    }
    
    setLoading(true);
    setError("");
    setResult("Loading milestones from blockchain...");
    
    try {
      // Dynamically import ethers to handle if it's not available
      let ethers;
      try {
        ethers = await import('ethers');
      } catch (importError) {
        console.warn("Ethers not available, using mock data");
        const mockMilestones = generateMockMilestones();
        setMilestones(mockMilestones);
        setResult(`Mock mode: Loaded ${mockMilestones.length} demo milestones`);
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, MILESTONE_ABI, signer);
      let allMilestones = [];
      
      // Method 1: Try the original string-based approach with proper BigInt handling
      for (const startupId of testStartupIds) {
        try {
          const startupMilestones = await contract.getStartupMilestones(startupId);
          
          // Process each milestone with safe BigInt conversion
          for (let i = 0; i < startupMilestones.length; i++) {
            try {
              const rawMilestone = startupMilestones[i];
              
              // Check if this mentor is assigned (handle both possible field names)
              const assignedMentor = rawMilestone.mentorAddress || rawMilestone.assignedMentor;
              
              if (assignedMentor && assignedMentor.toLowerCase() === address.toLowerCase()) {
                const processedMilestone = processMilestoneData(rawMilestone, startupId, i);
                
                if (processedMilestone) {
                  allMilestones.push(processedMilestone);
                }
              }
            } catch (milestoneError) {
              // Continue processing other milestones instead of breaking
              continue;
            }
          }
        } catch (error) {
          // Continue with other startups instead of failing completely
        }
      }

      // Method 2: Also try numeric startup IDs (1-10) with BigInt handling
      for (let startupId = 1; startupId <= 10; startupId++) {
        try {
          const startup = await contract.startups(startupId);
          if (startup.founder && startup.founder !== '0x0000000000000000000000000000000000000000') {
            // Get milestone count for this startup
            const milestoneCount = await contract.getMilestoneCount(startupId);
            const count = Number(safeConvertBigInt(milestoneCount));
            
            // Fetch each milestone with proper BigInt handling
            for (let i = 0; i < count; i++) {
              try {
                const rawMilestone = await contract.getMilestone(startupId, i);
                
                // Check if this mentor is assigned
                if (rawMilestone.assignedMentor && rawMilestone.assignedMentor.toLowerCase() === address.toLowerCase()) {
                  const processedMilestone = processMilestoneData({
                    ...rawMilestone,
                    mentorAddress: rawMilestone.assignedMentor,
                    milestoneType: 'general'
                  }, startupId.toString(), i);
                  
                  if (processedMilestone) {
                    allMilestones.push(processedMilestone);
                  }
                }
              } catch (err) {
                // Continue with other milestones
              }
            }
          }
        } catch (err) {
          // Startup doesn't exist, continue
        }
      }
      
      // Remove duplicates based on startupId + milestoneIndex
      const uniqueMilestones = allMilestones.filter((milestone, index, self) => 
        index === self.findIndex(m => 
          m.startupId === milestone.startupId && m.milestoneIndex === milestone.milestoneIndex
        )
      );
      
      setMilestones(uniqueMilestones);
      
      if (uniqueMilestones.length === 0) {
        setResult("No milestones assigned to you yet. Milestones will appear here when startups submit them for review.");
      } else {
        setResult(`Found ${uniqueMilestones.length} milestone(s) assigned for your review`);
      }
      
    } catch (error) {
      console.error("Error loading milestones:", error);
      setError(`Failed to load milestones: ${error.message}`);
      // Fallback to mock data
      const mockMilestones = generateMockMilestones();
      setMilestones(mockMilestones);
      setResult(`Blockchain connection failed, showing demo data (${mockMilestones.length} milestones)`);
    }
    
    setLoading(false);
  };

  // Enhanced verification function with better error handling
  const verifyMilestone = async (startupId, milestoneIndex) => {
    if (!signer) {
      setError("Wallet not connected");
      return;
    }
    
    setVerifyingMilestone(`${startupId}-${milestoneIndex}`);
    setError("");
    setResult("Processing verification transaction...");
    
    try {
      const ethers = await import('ethers');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MILESTONE_ABI, signer);

      // First check if milestone is already verified
      const currentMilestone = milestones.find(m => 
        m.startupId === startupId && m.milestoneIndex === milestoneIndex
      );
      
      if (currentMilestone && currentMilestone.verified) {
        setResult("This milestone is already verified!");
        setVerifyingMilestone(null);
        return;
      }

      // Submit verification transaction
      const tx = await contract.verifyMilestone(startupId, milestoneIndex);
      
      setResult(`Transaction submitted! Hash: ${tx.hash.substring(0, 10)}...
Waiting for blockchain confirmation...`);
      
      const receipt = await tx.wait();
      
      setResult(`Milestone verified successfully! 
Transaction: ${receipt.hash}
View on Snowtrace: https://testnet.snowtrace.io/tx/${receipt.hash}
Refreshing dashboard...`);

      // Update local state immediately for better UX
      setMilestones(prev => prev.map(m => 
        m.startupId === startupId && m.milestoneIndex === milestoneIndex 
          ? { ...m, verified: true }
          : m
      ));

      // Auto-refresh after successful verification
      setTimeout(() => {
        loadMilestones();
      }, 3000);

    } catch (error) {
      console.error("Error verifying milestone:", error);
      
      // Enhanced error handling
      let errorMsg = error.message;
      if (errorMsg.includes("user rejected")) {
        errorMsg = "Transaction cancelled by user";
      } else if (errorMsg.includes("insufficient funds")) {
        errorMsg = "Insufficient gas fees for transaction";
      } else if (errorMsg.includes("already verified")) {
        errorMsg = "This milestone has already been verified";
      } else if (errorMsg.includes("missing revert data")) {
        errorMsg = "Milestone might already be verified. Try refreshing the dashboard.";
      } else {
        errorMsg = `Verification failed: ${errorMsg}`;
      }
      
      setError(errorMsg);
      setResult("");
    }
    
    setVerifyingMilestone(null);
  };

  // Reject milestone function
  const rejectMilestone = async (startupId, milestoneIndex) => {
    setVerifyingMilestone(`${startupId}-${milestoneIndex}-reject`);
    setError("");
    setResult("Processing rejection...");
    
    try {
      // For demo purposes - mark as rejected locally
      // In production, you'd have a proper smart contract reject function
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate transaction
      
      setMilestones(prev => prev.map(m => 
        m.startupId === startupId && m.milestoneIndex === milestoneIndex 
          ? { ...m, rejected: true }
          : m
      ));
      
      setResult(`Milestone ${milestoneIndex + 1} marked for rejection/review`);
      
      setTimeout(() => {
        setResult("");
      }, 3000);
      
    } catch (error) {
      setError(`Rejection failed: ${error.message}`);
    }
    
    setVerifyingMilestone(null);
  };

  // Load milestones on component mount
  useEffect(() => {
    loadMilestones();
  }, [signer, address]);

  // Filter milestones based on current filter
  const filteredMilestones = milestones.filter(milestone => {
    if (milestoneFilter === 'pending') return !milestone.verified && !milestone.rejected;
    if (milestoneFilter === 'verified') return milestone.verified;
    if (milestoneFilter === 'rejected') return milestone.rejected;
    return true; // 'all'
  });

  // Calculate statistics
  const stats = {
    total: milestones.length,
    pending: milestones.filter(m => !m.verified && !m.rejected).length,
    verified: milestones.filter(m => m.verified).length,
    rejected: milestones.filter(m => m.rejected).length,
    totalValue: milestones.reduce((sum, m) => sum + (m.valueETH || 0), 0)
  };

  if (!address) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h2 style={{ color: "#666", marginBottom: "1rem" }}>Mentor Dashboard</h2>
        <p style={{ color: "#888" }}>Please connect your wallet to access the mentor dashboard</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
        borderRadius: "12px",
        color: "white"
      }}>
        <div>
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "2.5rem", fontWeight: "bold" }}>
            Mentor Dashboard
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "1.1rem" }}>
            Review and verify startup milestones
          </p>
          <p style={{ 
            margin: "0.5rem 0 0 0", 
            fontSize: "0.9rem", 
            fontFamily: "monospace", 
            backgroundColor: "rgba(255,255,255,0.2)", 
            padding: "0.25rem 0.5rem", 
            borderRadius: "4px",
            display: "inline-block"
          }}>
            {address}
          </p>
        </div>
        <button
          onClick={loadMilestones}
          disabled={loading}
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: loading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            transition: "all 0.3s ease"
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#2196f3", margin: "0 0 0.5rem 0" }}>
            {stats.total}
          </p>
          <p style={{ color: "#666", margin: 0, fontSize: "0.9rem" }}>Total Assigned</p>
        </div>
        
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#ff9800", margin: "0 0 0.5rem 0" }}>
            {stats.pending}
          </p>
          <p style={{ color: "#666", margin: 0, fontSize: "0.9rem" }}>Pending Review</p>
        </div>
        
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#4caf50", margin: "0 0 0.5rem 0" }}>
            {stats.verified}
          </p>
          <p style={{ color: "#666", margin: 0, fontSize: "0.9rem" }}>Verified</p>
        </div>
        
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#9c27b0", margin: "0 0 0.5rem 0" }}>
            {stats.totalValue.toFixed(3)}
          </p>
          <p style={{ color: "#666", margin: 0, fontSize: "0.9rem" }}>Total ETH Value</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {[
          { key: 'all', label: `All (${stats.total})`, color: '#2196f3' },
          { key: 'pending', label: `Pending (${stats.pending})`, color: '#ff9800' },
          { key: 'verified', label: `Verified (${stats.verified})`, color: '#4caf50' },
          { key: 'rejected', label: `Rejected (${stats.rejected})`, color: '#f44336' }
        ].map(filter => (
          <button 
            key={filter.key}
            onClick={() => setMilestoneFilter(filter.key)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: milestoneFilter === filter.key ? filter.color : "#f5f5f5",
              color: milestoneFilter === filter.key ? "white" : "#666",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "8px",
          color: "#c62828",
          fontSize: "0.9rem"
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: result.includes("failed") ? "#ffebee" : result.includes("successfully") ? "#e8f5e8" : "#fff3cd",
          border: `1px solid ${result.includes("failed") ? "#f44336" : result.includes("successfully") ? "#4caf50" : "#ffc107"}`,
          borderRadius: "8px",
          color: result.includes("failed") ? "#c62828" : result.includes("successfully") ? "#2e7d2e" : "#856404",
          whiteSpace: "pre-line",
          fontSize: "0.9rem"
        }}>
          {result}
        </div>
      )}

      {/* Milestones List */}
      {filteredMilestones.length === 0 && !loading ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          color: "#666",
          border: "2px dashed #ddd"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
          <p style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
            {milestoneFilter === 'all' ? 'No milestones assigned' : `No ${milestoneFilter} milestones`}
          </p>
          <p style={{ fontSize: "1rem" }}>
            {milestoneFilter === 'all' 
              ? 'Milestones submitted by startups will appear here for verification'
              : `Switch to "All" to see milestones in other states`
            }
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredMilestones.map((milestone) => {
            const isPending = !milestone.verified && !milestone.rejected;
            const statusColor = milestone.verified ? '#4caf50' : milestone.rejected ? '#f44336' : '#ff9800';
            const statusText = milestone.verified ? 'VERIFIED' : milestone.rejected ? 'REJECTED' : 'PENDING REVIEW';
            
            return (
              <div
                key={`${milestone.startupId}-${milestone.milestoneIndex}`}
                style={{
                  border: `3px solid ${statusColor}`,
                  borderRadius: "12px",
                  padding: "2rem",
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  position: "relative"
                }}
              >
                
                {/* Status Badge */}
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  right: "20px",
                  backgroundColor: statusColor,
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  {statusText}
                </div>

                {/* Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  paddingTop: "0.5rem"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: "#333", 
                        fontSize: "1.5rem",
                        fontWeight: "bold"
                      }}>
                        {milestone.startup?.name || milestone.startupId}
                      </h3>
                      {milestone.startup && (
                        <span style={{
                          backgroundColor: milestone.startup.color || '#e0e0e0',
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "bold"
                        }}>
                          {milestone.startup.category}
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      margin: "0 0 0.25rem 0", 
                      color: "#666", 
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}>
                      Milestone: <span style={{ color: "#2196f3" }}>{safeMilestoneType(milestone.milestoneType)}</span>
                    </p>
                    
                    {milestone.startup && (
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Users size={16} color="#666" />
                          <span style={{ fontSize: "0.9rem", color: "#666" }}>{milestone.startup.founder}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <MapPin size={16} color="#666" />
                          <span style={{ fontSize: "0.9rem", color: "#666" }}>{milestone.startup.college}</span>
                        </div>
                        {milestone.startup.url && (
                          <a 
                            href={milestone.startup.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "0.5rem", 
                              color: "#2196f3",
                              textDecoration: "none"
                            }}
                          >
                            <Globe size={16} />
                            <span style={{ fontSize: "0.9rem" }}>Visit Website</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: "right" }}>
                    <p style={{ 
                      margin: "0 0 0.25rem 0", 
                      fontSize: "2rem", 
                      fontWeight: "bold", 
                      color: "#4caf50" 
                    }}>
                      {milestone.valueETH ? milestone.valueETH.toFixed(4) : '0.0000'} ETH
                    </p>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.8rem" }}>
                      ({milestone.startup?.funding || 'Unknown'})
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {milestone.startup?.tags && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {milestone.startup.tags.map((tag, index) => (
                        <span key={index} style={{
                          backgroundColor: "#f0f8ff",
                          color: "#2196f3",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          border: "1px solid #e3f2fd"
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>
                      ASSIGNED MENTOR
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", fontFamily: "monospace", color: "#333" }}>
                      {milestone.mentorAddress || 'Not assigned'}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>
                      SUBMISSION DATE
                    </p>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#333" }}>
                      {milestone.formattedTime || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Proof Hash Section */}
                {milestone.proofHash && (
                  <div style={{
                    backgroundColor: "#f0f8ff",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #2196f3",
                    marginBottom: "1.5rem"
                  }}>
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#1976d2", fontWeight: "bold" }}>
                      PROOF OF COMPLETION
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "0.8rem", 
                        fontFamily: "monospace", 
                        color: "#333",
                        flex: 1,
                        wordBreak: "break-all"
                      }}>
                        {milestone.proofHash}
                      </p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(milestone.proofHash);
                          setResult("Proof hash copied to clipboard!");
                          setTimeout(() => setResult(""), 2000);
                        }}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#2196f3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem"
                        }}
                        title="Copy proof hash"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    {isPending && (
                      <>
                        <button
                          onClick={() => verifyMilestone(milestone.startupId, milestone.milestoneIndex)}
                          disabled={verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}`}
                          style={{
                            padding: "1rem 2rem",
                            backgroundColor: verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}` ? "#cccccc" : "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}` ? "not-allowed" : "pointer",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            transition: "all 0.3s ease"
                          }}
                        >
                          {verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}` ? "Verifying..." : "Verify Milestone"}
                        </button>
                        
                        <button
                          onClick={() => rejectMilestone(milestone.startupId, milestone.milestoneIndex)}
                          disabled={verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}-reject`}
                          style={{
                            padding: "1rem 2rem",
                            backgroundColor: verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}-reject` ? "#cccccc" : "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}-reject` ? "not-allowed" : "pointer",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            transition: "all 0.3s ease"
                          }}
                        >
                          {verifyingMilestone === `${milestone.startupId}-${milestone.milestoneIndex}-reject` ? "Processing..." : "Reject"}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Status Indicators */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {milestone.verified && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: "#e8f5e8",
                        color: "#2e7d2e",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "bold"
                      }}>
                        <span>Verified on Chain</span>
                      </div>
                    )}
                    
                    {milestone.rejected && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "bold"
                      }}>
                        <span>Rejected</span>
                      </div>
                    )}
                    
                    {isPending && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "bold"
                      }}>
                        <span>Awaiting Review</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions Panel */}
      <div style={{
        marginTop: "2rem",
        backgroundColor: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "12px",
        border: "1px solid #e0e0e0"
      }}>
        <h4 style={{ margin: "0 0 1rem 0", color: "#333", fontSize: "1.2rem", fontWeight: "bold" }}>
          Quick Actions
        </h4>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button 
            onClick={() => setMilestoneFilter('pending')}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffc107",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            Review Pending ({stats.pending})
          </button>
          
          <button 
            onClick={loadMilestones}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              border: "1px solid #2196f3",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            Sync with Blockchain
          </button>
          
          <button 
            onClick={() => setMilestoneFilter('verified')}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#e8f5e8",
              color: "#2e7d2e",
              border: "1px solid #4caf50",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            View Verified ({stats.verified})
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMentorDashboard;