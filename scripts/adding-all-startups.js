// adding-all-startups.js - Modified to use existing startup data structure
const { ethers } = require("hardhat");

// Your complete startup data from the registry
const structuredStartups = [
  {
    id: "learny-hive-001",
    name: "LearnyHive",
    founder: "Bhanush Gowda",
    college: "EPCET Bangalore, 3rd Year",
    funding: "₹45 Lakhs",
    fundingETH: 0.45,
    tags: ["Ed tech", "Innovation"],
    url: "https://www.learnyhive.com/",
    category: "EdTech",
    color: "#FF5733",
    description: "Educational technology platform revolutionizing learning experiences",
    sector: "Education"
  },
  {
    id: "waiter-company-001",
    name: "The Waiter Company",
    founder: "Ishan Purohit",
    college: "RV University, 4th Year",
    funding: "₹32 Lakhs",
    fundingETH: 0.32,
    tags: ["FoodTech", "Logistics"],
    url: "https://www.thewaitercompany.in/",
    category: "FoodTech",
    color: "#4A90E2",
    description: "Food delivery and restaurant management solution",
    sector: "Food & Beverage"
  },
  {
    id: "saathi-app-001",
    name: "Saathi App",
    founder: "Abhay Gupta",
    college: "RV College, Bangalore, 3rd Year",
    funding: "₹20 Lakhs",
    fundingETH: 0.2,
    tags: ["Innovative", "Social"],
    url: "https://www.saathiapp.in/",
    category: "Social",
    color: "#50C878",
    description: "Social platform connecting students and communities",
    sector: "Social Networking"
  },
  {
    id: "kampus-001",
    name: "Kampus",
    founder: "Hemanth Gowda",
    college: "Reva College, Bangalore, 3rd Year",
    funding: "₹50 Lakhs",
    fundingETH: 0.5,
    tags: ["Meets", "Social"],
    url: "https://www.kampus.social/",
    category: "Social",
    color: "#50C878",
    description: "Campus social networking and meetup platform",
    sector: "Social Networking"
  },
  {
    id: "nologin-001",
    name: "NoLogin",
    founder: "Deekshith B",
    college: "BMS College, Bangalore, 3rd Year",
    funding: "₹10 Lakhs",
    fundingETH: 0.1,
    tags: ["Innovative", "Logistics"],
    url: "https://www.nologin.in/",
    category: "Logistics",
    color: "#50C878",
    description: "Innovative logistics and authentication solutions",
    sector: "Technology"
  },
  {
    id: "krewsup-001",
    name: "Krewsup",
    founder: "S Hari Raghava",
    college: "Reva College, Bangalore, 3rd Year",
    funding: "₹20 Lakhs",
    fundingETH: 0.2,
    tags: ["Innovative", "Health"],
    url: "https://www.Krewsup.com/",
    category: "Health",
    color: "#50C878",
    description: "Health and wellness platform for students",
    sector: "Healthcare"
  },
  {
    id: "kavastra-001",
    name: "Kavastra",
    founder: "Shashikant kalal",
    college: "University of Visvesvaraya College of Engineering, Bangalore, 4th Year",
    funding: "₹12 Lakhs",
    fundingETH: 0.12,
    tags: ["Innovative", "Health"],
    url: "http://www.kavastra.com/",
    category: "Health",
    color: "#50C878",
    description: "Healthcare innovation and medical technology solutions",
    sector: "Healthcare"
  },
  {
    id: "guidero-001",
    name: "Guidero Private Limited",
    founder: "C H Sanjana",
    college: "Christ University, 4th Year",
    funding: "₹12 Lakhs",
    fundingETH: 0.12,
    tags: ["Travel", "Innovative"],
    url: "www.guidero.in",
    category: "Travel",
    color: "#50C878",
    description: "Travel guidance and tourism platform",
    sector: "Travel & Tourism"
  },
  {
    id: "magnus-chocolates-001",
    name: "Magnus Chocolates",
    founder: "Mayank Singh",
    college: "NIFT Delhi",
    funding: "₹45 Lakhs",
    fundingETH: 0.45,
    tags: ["Food Tech", "Service"],
    url: "https://www.instagram.com/magnus_chocolates?igsh=aGl2OHR5bzQ2MHNv",
    category: "FoodTech",
    color: "#FF5733",
    description: "Premium chocolate manufacturing and distribution",
    sector: "Food & Beverage"
  },
  {
    id: "chitva-skincare-001",
    name: "Chitva- A Personalised Skincare Brand",
    founder: "Yerramshetty Suchita",
    college: "MSR University, 4th Year",
    funding: "₹32 Lakhs",
    fundingETH: 0.32,
    tags: ["Skincare", "Beauty"],
    url: "https://www.linkedin.com/in/yerramsetty-sai-venkata-suchita-suchta1234?",
    category: "Beauty",
    color: "#4A90E2",
    description: "Personalized skincare solutions and beauty products",
    sector: "Beauty & Personal Care"
  },
  {
    id: "start-shape-creative-001",
    name: "Start Shape",
    founder: "Jesvin Saji",
    college: "Garden City University, Bangalore, 3rd Year",
    funding: "₹20 Lakhs",
    fundingETH: 0.2,
    tags: ["Solutions Company", "Creative"],
    url: "https://www.starshape.in/",
    category: "Creative",
    color: "#50C878",
    description: "Creative solutions and design services company",
    sector: "Creative Services"
  },
  {
    id: "myniquee-art-001",
    name: "Myniquee",
    founder: "Vasundhara",
    college: "Reva College, Bangalore, 3rd Year",
    funding: "₹50 Lakhs",
    fundingETH: 0.5,
    tags: ["Creative", "Art"],
    url: "https://www.instagram.com/myniquee_12?igsh=MXhjdHQ5eTRkZTBrag==",
    category: "Art",
    color: "#50C878",
    description: "Unique art and creative design platform",
    sector: "Art & Design"
  }
];

async function main() {
  console.log("🚀 Starting startup integration to blockchain...");
  
  // First, let's check what contracts are available
  console.log("🔍 Checking available contracts...");
  
  // Try your actual contract names
  const possibleContractNames = [
    "MilestoneVerification",
    "mintstoneverificaiton", 
    "investorsbt",
    "InvestorSBT",
    "investorpassport",
    "InvestorPassport"
  ];
  
  let ContractFactory;
  let contractName;
  
  for (const name of possibleContractNames) {
    try {
      ContractFactory = await ethers.getContractFactory(name);
      contractName = name;
      console.log(`✅ Found contract: ${name}`);
      break;
    } catch (error) {
      console.log(`❌ Contract ${name} not found`);
    }
  }
  
  if (!ContractFactory) {
    console.log("💥 No contract found! Please check:");
    console.log("1. Run 'npx hardhat compile' first");
    console.log("2. Check your contracts/ folder for the actual contract name");
    console.log("3. Make sure the contract is properly compiled");
    return;
  }
  
  // Replace with your actual contract address
  const CONTRACT_ADDRESS = "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395";
  const contract = ContractFactory.attach(CONTRACT_ADDRESS);
  
  // Your mentor address
  const MENTOR_ADDRESS = "0xc24d56F9887e3a39fABd42706E91712C145b138f";
  
  console.log(`📋 Processing ${structuredStartups.length} startups...`);
  console.log(`🎯 Mentor Address: ${MENTOR_ADDRESS}`);
  console.log(`📄 Contract Address: ${CONTRACT_ADDRESS}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < structuredStartups.length; i++) {
    const startup = structuredStartups[i];
    console.log(`\n📊 ${i + 1}. Processing: ${startup.name}`);
    console.log(`   🆔 ID: ${startup.id}`);
    console.log(`   👤 Founder: ${startup.founder}`);
    console.log(`   💰 Funding: ${startup.funding} (${startup.fundingETH} ETH)`);
    
    try {
      // Step 1: Assign mentor to startup (if not already assigned)
      console.log(`   👤 Assigning mentor to ${startup.name}...`);
      
      try {
        const assignTx = await contract.assignMentor(startup.id, MENTOR_ADDRESS, {
          gasLimit: 200000
        });
        await assignTx.wait();
        console.log(`   ✅ Mentor assigned successfully`);
      } catch (assignError) {
        // Mentor might already be assigned, continue with milestone creation
        console.log(`   ⚠️  Mentor assignment note: ${assignError.message}`);
      }
      
      // Step 2: Submit initial milestone for the startup
      console.log(`   📝 Submitting milestone for ${startup.name}...`);
      
      const tx = await contract.submitMilestone(
        startup.id,
        "funding", // milestoneType
        Math.floor(startup.fundingETH * 100), // Convert ETH to a reasonable integer (0.45 -> 45)
        `${startup.name} founded by ${startup.founder} from ${startup.college}. ${startup.description}`,
        "" // Empty proof hash for now, you can add IPFS hash later
      );
      
      console.log(`   ⏳ Transaction submitted: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`   ✅ Milestone submitted in block: ${receipt.blockNumber}`);
      
      successCount++;
      
      // Add a small delay to avoid overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`   ❌ Error processing ${startup.name}:`, error.message);
      errorCount++;
      
      // Continue with next startup even if one fails
      continue;
    }
  }
  
  console.log("\n🎉 Integration Summary:");
  console.log(`✅ Successful integrations: ${successCount}`);
  console.log(`❌ Failed integrations: ${errorCount}`);
  console.log(`📊 Total startups processed: ${structuredStartups.length}`);
  
  if (successCount > 0) {
    console.log("\n🔍 Next steps:");
    console.log("1. Check your mentor dashboard to see the new startups");
    console.log("2. Verify milestone submissions are working");
    console.log("3. Test funding distribution");
  }
  
  // Generate summary data for frontend
  const summaryData = {
    totalStartups: structuredStartups.length,
    totalFunding: structuredStartups.reduce((sum, s) => sum + parseFloat(s.funding.replace(/[₹,\s]/g, '').replace('Lakhs', '')), 0),
    totalFundingETH: structuredStartups.reduce((sum, s) => sum + s.fundingETH, 0),
    categories: [...new Set(structuredStartups.map(s => s.category))],
    successfulIntegrations: successCount,
    errors: errorCount,
    mentorAddress: MENTOR_ADDRESS,
    contractAddress: CONTRACT_ADDRESS,
    lastUpdated: new Date().toISOString()
  };
  
  console.log("\n📊 Frontend Summary Data:");
  console.log(JSON.stringify(summaryData, null, 2));
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎯 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { structuredStartups };