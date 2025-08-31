// startup-data-manager.js
// This script helps manage and structure your startup data for blockchain integration

const fs = require('fs');
const path = require('path');

// Complete and cleaned startup data
const structuredStartups = [
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
    category: "EdTech",
    description: "Educational technology platform revolutionizing learning experiences",
    sector: "Education"
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
    category: "FoodTech",
    description: "Food delivery and restaurant management solution",
    sector: "Food & Beverage"
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
    category: "Social",
    description: "Social networking platform for meaningful connections",
    sector: "Social Technology"
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
    category: "Social",
    description: "Campus networking and event management platform",
    sector: "Social Technology"
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
    category: "Logistics",
    description: "Seamless authentication and logistics solution",
    sector: "Technology"
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
    category: "Health",
    description: "Healthcare support and wellness platform",
    sector: "Healthcare"
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
    category: "Health",
    description: "Innovative healthcare solutions and medical technology",
    sector: "Healthcare"
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
    category: "Travel",
    description: "Travel guidance and tourism management platform",
    sector: "Travel & Tourism"
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
    category: "FoodTech",
    description: "Premium chocolate manufacturing and distribution",
    sector: "Food & Beverage"
  },
  {
    id: "chitva-001",
    name: "Chitva- A Personalised Skincare Brand",
    funding: "₹32 Lakhs",
    fundingETH: 0.32,
    tags: ["Skincare", "Beauty"],
    founder: "Yerramshetty Suchita",
    college: "MSR University, 4th Year",
    color: "#4A90E2",
    url: "https://www.linkedin.com/in/yerramsetty-sai-venkata-suchita-suchta1234?",
    category: "Beauty",
    description: "Personalized skincare solutions using advanced technology",
    sector: "Beauty & Wellness"
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
    category: "Creative",
    description: "Creative solutions and design services company",
    sector: "Creative Services"
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
    category: "Art",
    description: "Unique art and creative expression platform",
    sector: "Art & Design"
  }
];

// Generate milestone templates for each startup
const generateMilestones = (startup) => {
  return [
    {
      type: "users",
      description: `${startup.name} - User Acquisition Milestone`,
      target: "Reach 1000+ active users",
      valueETH: startup.fundingETH * 0.2,
      valueINR: parseFloat(startup.funding.replace(/[₹,\sLakhs]/g, '')) * 0.2,
      priority: "High"
    },
    {
      type: "funding",
      description: `${startup.name} - Initial Funding Milestone`,
      target: "Secure seed funding round",
      valueETH: startup.fundingETH * 0.3,
      valueINR: parseFloat(startup.funding.replace(/[₹,\sLakhs]/g, '')) * 0.3,
      priority: "Critical"
    },
    {
      type: "product",
      description: `${startup.name} - Product Development Milestone`,
      target: "Launch MVP and iterate based on feedback",
      valueETH: startup.fundingETH * 0.3,
      valueINR: parseFloat(startup.funding.replace(/[₹,\sLakhs]/g, '')) * 0.3,
      priority: "High"
    },
    {
      type: "funding",
      description: `${startup.name} - Growth Funding Milestone`,
      target: "Secure Series A funding",
      valueETH: startup.fundingETH * 0.2,
      valueINR: parseFloat(startup.funding.replace(/[₹,\sLakhs]/g, '')) * 0.2,
      priority: "Medium"
    }
  ];
};

// Generate complete startup profiles with milestones
const generateCompleteProfiles = () => {
  return structuredStartups.map(startup => ({
    ...startup,
    milestones: generateMilestones(startup),
    status: "Active",
    dateAdded: new Date().toISOString(),
    mentorAssigned: "0xc24d56F9887e3a39fABd42706E91712C145b138f",
    blockchainId: startup.id,
    totalMilestones: 4,
    completedMilestones: Math.floor(Math.random() * 2), // Random for demo
    nextMilestone: "User Acquisition"
  }));
};

// Export functions for use in other scripts
const exportData = () => {
  const completeProfiles = generateCompleteProfiles();
  
  // Create different export formats
  const exports = {
    // For blockchain integration
    blockchainData: structuredStartups.map(s => ({
      id: s.id,
      name: s.name,
      fundingETH: s.fundingETH,
      mentorAddress: "0xc24d56F9887e3a39fABd42706E91712C145b138f"
    })),
    
    // For frontend display
    frontendData: completeProfiles,
    
    // For milestone tracking
    milestonesData: completeProfiles.flatMap(startup => 
      startup.milestones.map((milestone, index) => ({
        startupId: startup.id,
        startupName: startup.name,
        milestoneIndex: index,
        ...milestone,
        startup: startup
      }))
    ),
    
    // Summary statistics
    summary: {
      totalStartups: structuredStartups.length,
      totalFunding: structuredStartups.reduce((sum, s) => 
        sum + parseFloat(s.funding.replace(/[₹,\sLakhs]/g, '')), 0
      ),
      totalFundingETH: structuredStartups.reduce((sum, s) => sum + s.fundingETH, 0),
      categories: [...new Set(structuredStartups.map(s => s.category))],
      colleges: [...new Set(structuredStartups.map(s => s.college))],
      sectors: [...new Set(structuredStartups.map(s => s.sector))]
    }
  };
  
  return exports;
};

// Main execution
const main = () => {
  console.log("🚀 Generating startup data exports...");
  
const exportData = module.exports;  
  // Save to files (optional)
  try {
    fs.writeFileSync(
      path.join(__dirname, 'startup-blockchain-data.json'), 
      JSON.stringify(exportData.blockchainData, null, 2)
    );
    
    fs.writeFileSync(
      path.join(__dirname, 'startup-frontend-data.json'), 
      JSON.stringify(exportData.frontendData, null, 2)
    );
    
    fs.writeFileSync(
      path.join(__dirname, 'startup-milestones-data.json'), 
      JSON.stringify(exportData.milestonesData, null, 2)
    );
    
    console.log("✅ Data files exported successfully!");
  } catch (error) {
    console.log("ℹ️  File export skipped (running in browser environment)");
  }
  
  // Display summary
  console.log("\n📊 Startup Portfolio Summary:");
  console.log(`📈 Total Startups: ${exportData.summary.totalStartups}`);
  console.log(`💰 Total Funding: ₹${exportData.summary.totalFunding} Lakhs`);
  console.log(`⚡ Total Funding (ETH): ${exportData.summary.totalFundingETH} ETH`);
  console.log(`🏷️  Categories: ${exportData.summary.categories.join(', ')}`);
  console.log(`🎓 Unique Colleges: ${exportData.summary.colleges.length}`);
  
  console.log("\n🔗 Blockchain Integration Ready!");
  console.log("All startup IDs prepared for smart contract integration:");
  exportData.blockchainData.forEach(startup => {
    console.log(`- ${startup.id} (${startup.name}) - ${startup.fundingETH} ETH`);
  });
  
  return exportData;
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    structuredStartups,
    generateMilestones,
    generateCompleteProfiles,
    exportData: main
  };
} else {
  // Browser environment
  window.startupDataManager = {
    structuredStartups,
    generateMilestones,
    generateCompleteProfiles,
    exportData: main
  };
}

// Auto-run if this is the main script
if (require.main === module) {
  main();
}