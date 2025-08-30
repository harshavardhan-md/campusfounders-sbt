const hre = require("hardhat");

async function main() {
  console.log("Setting up mentors and assignments...");

  // Contract address from your deployment
  const contractAddress = "0x9Cf969C1D5bEd8D568556104fD1c2b54c4C5A395";
  
  // Get the contract
  const MilestoneVerification = await hre.ethers.getContractFactory("MilestoneVerification");
  const contract = await MilestoneVerification.attach(contractAddress);
  
  // Get deployer account (this is the owner)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Owner address:", deployer.address);
  
  // Step 1: Add mentors
  console.log("\n=== Adding Mentors ===");
  
  // Mentor addresses (you can use any addresses for testing)
  const mentorAddresses = [
    deployer.address, // Owner is also a mentor
    "0x1234567890123456789012345678901234567890", // Test mentor 1
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"  // Test mentor 2
  ];
  
  for (let i = 0; i < mentorAddresses.length; i++) {
    try {
      console.log(`Adding mentor ${i + 1}: ${mentorAddresses[i]}`);
      const tx = await contract.addMentor(mentorAddresses[i]);
      await tx.wait();
      console.log(`✅ Mentor ${i + 1} added successfully`);
    } catch (error) {
      console.log(`❌ Error adding mentor ${i + 1}:`, error.message);
    }
  }
  
  // Step 2: Assign mentors to startups
  console.log("\n=== Assigning Mentors to Startups ===");
  
  const assignments = [
    { startupId: "campus-founders-001", mentorAddress: deployer.address },
    { startupId: "learny-hive-001", mentorAddress: deployer.address },
    { startupId: "startup-alpha-001", mentorAddress: deployer.address }
  ];
  
  for (const assignment of assignments) {
    try {
      console.log(`Assigning ${assignment.mentorAddress} to ${assignment.startupId}`);
      const tx = await contract.assignMentor(assignment.startupId, assignment.mentorAddress);
      await tx.wait();
      console.log(`✅ Assignment successful`);
    } catch (error) {
      console.log(`❌ Error in assignment:`, error.message);
    }
  }
  
  console.log("\n=== Setup Complete! ===");
  console.log("You can now submit milestones for these startup IDs:");
  assignments.forEach(a => console.log(`- ${a.startupId}`));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });