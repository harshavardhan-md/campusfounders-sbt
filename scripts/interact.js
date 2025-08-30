// scripts/interact.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [admin, investor] = await hre.ethers.getSigners();

  const contractAddr = process.env.CONTRACT_ADDRESS;
  const InvestorVerification = await hre.ethers.getContractFactory("InvestorVerification");
  const contract = InvestorVerification.attach(contractAddr);

  console.log("Admin:", admin.address);
  console.log("Investor:", investor.address);

  // 1. Investor requests verification (with some metadata string, e.g. "KYC123")
  const tx1 = await contract.connect(investor).requestVerification("KYC123");
  await tx1.wait();
  console.log("✅ Investor requested verification");

  // 2. Admin approves investor
  const tx2 = await contract.connect(admin).approveRequest(investor.address);
  await tx2.wait();
  console.log("✅ Admin approved investor");

  // 3. Check verification status
  const verified = await contract.isVerified(investor.address);
  console.log("🔍 Investor verified status:", verified);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
