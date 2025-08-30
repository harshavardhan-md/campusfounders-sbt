const hre = require("hardhat");

async function main() {
  console.log("Deploying MilestoneVerification contract...");

  // Get the contract factory
  const MilestoneVerification = await hre.ethers.getContractFactory("MilestoneVerification");
  
  // Deploy the contract
  const milestoneVerification = await MilestoneVerification.deploy();
  
  // Wait for deployment
  await milestoneVerification.waitForDeployment();
  
  const contractAddress = await milestoneVerification.getAddress();
  console.log("MilestoneVerification deployed to:", contractAddress);
  
  // Add a test mentor (optional)
  console.log("Adding test mentor...");
  const testMentorAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual address
  // await milestoneVerification.addMentor(testMentorAddress);
  
  console.log("\n=== Deployment Complete ===");
  console.log("Contract Address:", contractAddress);
  console.log("Add this to your .env file as MILESTONE_CONTRACT_ADDRESS");
  
  // Verify contract (optional, for mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });