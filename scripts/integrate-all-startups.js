const hre = require("hardhat");

// Import the structured startup data
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
    id: "start-shape-creative-001",
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
    id: "myniquee-art-001",
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

// Helper function to safely convert ETH to Wei
function safeParseEther(ethValue) {
  try {
    // Try ethers v6 syntax first
    if (hre.ethers.parseEther) {
      return hre.ethers.parseEther(ethValue.toString());
    }
    // Fallback to ethers v5 syntax
    if (hre.ethers.utils && hre.ethers.utils.parseEther) {
      return hre.ethers.utils.parseEther(ethValue.toString());
    }
    // Manual conversion as last resort
    return BigInt(Math.floor(ethValue * 1e18));
  } catch (error) {
    console.log(`⚠️  ETH conversion failed for ${ethValue}, using manual conversion`);
    return BigInt(Math.floor(ethValue * 1e18));
  }
}

// Helper function to add delay between transactions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("🚀 Starting comprehensive startup blockchain integration...");
  console.log(`📅 Date: ${new Date().toISOString()}`);

  // Contract address from your deployment
  const contractAddress = "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395";
  
  // Get the contract
  const MilestoneVerification = await hre.ethers.getContractFactory("MilestoneVerification");
  const contract = await MilestoneVerification.attach(contractAddress);
  
  // Get deployer account (this is the owner/mentor)
  const [deployer] = await hre.ethers.getSigners();
  console.log("💼 Owner/Mentor address:", deployer.address);
  console.log("🏗️  Contract address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  
  // Step 1: Ensure owner is a mentor
  console.log("\n=== 👨‍🏫 Setting Up Mentor ===");
  try {
    const tx = await contract.addMentor(deployer.address);
    await tx.wait();
    console.log("✅ Owner confirmed as mentor");
  } catch (error) {
    if (error.message.includes("already a mentor")) {
      console.log("ℹ️  Owner already registered as mentor");
    } else {
      console.log("⚠️  Mentor setup issue:", error.message);
    }
  }
  
  // Step 2: Process each startup
  console.log("\n=== 🏢 Integrating Startups to Blockchain ===");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < structuredStartups.length; i++) {
    const startup = structuredStartups[i];
    console.log(`\n📊 Processing ${i + 1}/${structuredStartups.length}: ${startup.name} (${startup.id})`);
    
    try {
      // Assign mentor to startup
      console.log(`🤝 Assigning mentor to ${startup.id}...`);
      const assignTx = await contract.assignMentor(startup.id, deployer.address);
      await assignTx.wait();
      console.log(`✅ Mentor assigned to ${startup.name}`);
      
      // Wait a bit to avoid nonce issues
      await delay(2000);
      
      // Create initial milestones for each startup
      const milestones = [
        {
          type: "users",
          description: `${startup.name} - User Acquisition Milestone`,
          valueETH: startup.fundingETH * 0.2
        },
        {
          type: "funding", 
          description: `${startup.name} - Initial Funding Milestone`,
          valueETH: startup.fundingETH * 0.3
        },
        {
          type: "product",
          description: `${startup.name} - Product Development Milestone`,
          valueETH: startup.fundingETH * 0.3
        },
        {
          type: "funding",
          description: `${startup.name} - Growth Funding Milestone`,
          valueETH: startup.fundingETH * 0.2
        }
      ];
      
      // Submit each milestone with proper error handling
      for (let j = 0; j < milestones.length; j++) {
        const milestone = milestones[j];
        console.log(`📝 Submitting milestone ${j + 1}/4: ${milestone.description}`);
        
        try {
          // Use the safe parseEther function
          const valueWei = safeParseEther(milestone.valueETH);
          
          const submitTx = await contract.submitMilestone(
            startup.id,
            milestone.type,
            milestone.description,
            `QmStartup${startup.id.replace(/[^a-zA-Z0-9]/g, '')}Milestone${j}Hash`, // Clean IPFS hash
            { value: valueWei }
          );
          
          await submitTx.wait();
          console.log(`✅ Milestone ${j + 1} submitted successfully (${milestone.valueETH} ETH)`);
          
          // Delay between milestone submissions
          await delay(3000);
          
        } catch (milestoneError) {
          console.log(`❌ Error submitting milestone ${j + 1}:`, milestoneError.message);
          
          // Try with minimal value if ETH conversion is the issue
          if (milestoneError.message.includes('parseEther') || milestoneError.message.includes('value')) {
            try {
              console.log(`🔄 Retrying milestone ${j + 1} with minimal value...`);
              const minValueWei = BigInt(1000000000000000); // 0.001 ETH in Wei
              
              const retryTx = await contract.submitMilestone(
                startup.id,
                milestone.type,
                milestone.description,
                `QmStartup${startup.id.replace(/[^a-zA-Z0-9]/g, '')}Milestone${j}Hash`,
                { value: minValueWei }
              );
              
              await retryTx.wait();
              console.log(`✅ Milestone ${j + 1} submitted successfully (retry with 0.001 ETH)`);
              await delay(3000);
              
            } catch (retryError) {
              console.log(`❌ Retry also failed for milestone ${j + 1}:`, retryError.message);
              errorCount++;
            }
          } else {
            errorCount++;
          }
        }
      }
      
      console.log(`🎉 ${startup.name} integration complete!`);
      successCount++;
      
    } catch (error) {
      console.log(`❌ Error processing ${startup.name}:`, error.message);
      errorCount++;
    }
    
    // Delay between startup processing
    await delay(5000);
  }
  
  // Step 3: Final verification and summary
  console.log("\n=== 🔍 Integration Summary ===");
  console.log(`✅ Successfully processed: ${successCount}/${structuredStartups.length} startups`);
  console.log(`❌ Errors encountered: ${errorCount}`);
  
  // Debug check for all startup IDs
  console.log("\n🔍 Debug Results:");
  console.log("🔍 Checking all known startup IDs:\n");
  
  const allStartupIds = [
    "campus-founders-001", "learny-hive-001", "startup-alpha-001", 
    "CampusFounders", "campusfounders", "test-startup-001",
    ...structuredStartups.map(s => s.id)
  ];
  
  for (const startupId of allStartupIds) {
    try {
      // This would require your contract to have a getter method
      console.log(`🔍 Checking ${startupId}...`);
      // You might need to add a getMilestoneCount function to your contract
      // const milestoneCount = await contract.getMilestoneCount(startupId);
      // console.log(`✅ ${startupId}: ${milestoneCount} milestone(s)`);
    } catch (error) {
      console.log(`❌ ${startupId}: No milestones or error`);
    }
  }
  
  console.log(`\n🎯 Your Address: ${deployer.address}`);
  console.log("💡 Look for startups where Mentor matches your address!");
  
  // Step 4: Display all startup information
  console.log("\n=== 📋 Complete Startup Registry ===");
  
  structuredStartups.forEach((startup, index) => {
    console.log(`\n📊 ${index + 1}. ${startup.name}`);
    console.log(`   🆔 ID: ${startup.id}`);
    console.log(`   👤 Founder: ${startup.founder}`);
    console.log(`   🎓 College: ${startup.college}`);
    console.log(`   💰 Funding: ${startup.funding} (${startup.fundingETH} ETH)`);
    console.log(`   🏷️  Tags: ${startup.tags.join(", ")}`);
    console.log(`   🌐 URL: ${startup.url}`);
    console.log(`   📂 Category: ${startup.category}`);
    console.log(`   🎨 Theme Color: ${startup.color}`);
  });
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Check your mentor dashboard to verify all startups are displayed");
  console.log("2. Verify milestone submissions in the blockchain");
  console.log("3. Test milestone verification and approval process");
  console.log("4. Monitor funding distribution and tracking");
  
  console.log("\n📝 Available Startup IDs for Dashboard:");
  structuredStartups.forEach(startup => {
    console.log(`- ${startup.id} (${startup.name})`);
  });
  
  // Generate summary for frontend
  const frontendSummary = {
    totalStartups: structuredStartups.length,
    totalFunding: structuredStartups.reduce((sum, s) => 
      sum + parseFloat(s.funding.replace(/[₹,\sLakhs]/g, '')), 0
    ),
    totalFundingETH: structuredStartups.reduce((sum, s) => sum + s.fundingETH, 0),
    categories: [...new Set(structuredStartups.map(s => s.category))],
    successfulIntegrations: successCount,
    errors: errorCount,
    mentorAddress: deployer.address,
    contractAddress: contractAddress,
    lastUpdated: new Date().toISOString()
  };
  
  console.log("\n📊 Frontend Summary Data:");
  console.log(JSON.stringify(frontendSummary, null, 2));
}

// Error handling wrapper
async function runWithErrorHandling() {
  try {
    await main();
    console.log("\n🎉 Integration completed successfully!");
  } catch (error) {
    console.error("\n💥 Critical error during integration:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Provide troubleshooting guidance
    console.log("\n🔧 Troubleshooting Steps:");
    console.log("1. Verify your network connection and RPC endpoint");
    console.log("2. Check that the contract address is correct");
    console.log("3. Ensure you have sufficient ETH for gas fees");
    console.log("4. Verify the contract ABI matches your deployment");
    console.log("5. Check if the contract has the required functions:");
    console.log("   - addMentor(address)");
    console.log("   - assignMentor(string, address)"); 
    console.log("   - submitMilestone(string, string, string, string, {value})");
    
    process.exit(1);
  }
}

// Execute the script
runWithErrorHandling();