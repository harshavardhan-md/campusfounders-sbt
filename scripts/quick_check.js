// scripts/quick_check.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddr = process.env.CONTRACT_SBT_ADDRESS;
  const InvestorSBT = await hre.ethers.getContractFactory("InvestorSBT");
  const sbt = InvestorSBT.attach(contractAddr);

  // Test the exact addresses your frontend is using
  const testAddresses = [
    "0xc24d56F9887e3a39fABd42706E91712C145b138f",
    "0xb39Ebd4AD032A4758F6876E2Cc26240692F20a5D"
  ];

  for (const addr of testAddresses) {
    console.log(`\nTesting: ${addr}`);
    
    const tokenId = await sbt.tokenOf(addr);
    console.log(`tokenOf result: ${tokenId} (type: ${typeof tokenId})`);
    
    if (tokenId.toString() !== "0") {
      const isValid = await sbt.isValid(tokenId);
      const isVerified = await sbt.isVerifiedInvestor(addr);
      console.log(`isValid: ${isValid}`);
      console.log(`isVerifiedInvestor: ${isVerified}`);
      
      // This is exactly what your frontend should see
      console.log(`Frontend should see: HAS SBT`);
    } else {
      console.log(`Frontend should see: NO SBT`);
    }
  }
}

main().catch(console.error);