// scripts/check_sbt.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [issuer, investor] = await hre.ethers.getSigners();

  const contractAddr = process.env.CONTRACT_SBT_ADDRESS; // SBT contract address
  const InvestorSBT = await hre.ethers.getContractFactory("InvestorSBT");
  const sbt = InvestorSBT.attach(contractAddr);

  console.log("Issuer:", issuer.address);
  console.log("Investor:", investor.address);

  const tokenId = await sbt.tokenOf(investor.address);
  if (tokenId.toString() === "0") {
    console.log("❌ Investor does not have an SBT yet");
    return;
  }

  console.log(`✅ Investor has SBT with Token ID: ${tokenId}`);

  const isValid = await sbt.isValid(tokenId);
  console.log(`🔍 Token is valid: ${isValid}`);

  const credential = await sbt.credentialOf(tokenId);
  console.log("📄 Credential details:");
  console.log(` - Credential Hash: ${credential.credentialHash}`);
  
  // Convert BigInt to Number for timestamps
  const issuedAtNumber = Number(credential.issuedAt);
  const expiresAtNumber = Number(credential.expiresAt);
  
  console.log(` - Issued At: ${new Date(issuedAtNumber * 1000).toISOString()}`);
  console.log(` - Expires At: ${expiresAtNumber ? new Date(expiresAtNumber * 1000).toISOString() : "No expiry"}`);
  console.log(` - Revoked: ${credential.revoked}`);
  console.log(` - Metadata URI: ${credential.uri}`);

  // Additional useful checks for your hackathon demo
  console.log("\n🔍 Additional Verification Checks:");
  
  // Check if investor is verified (helper function)
  const isVerified = await sbt.isVerifiedInvestor(investor.address);
  console.log(` - Is Verified Investor: ${isVerified}`);
  
  // Get token URI
  try {
    const tokenURI = await sbt.tokenURI(tokenId);
    console.log(` - Token URI: ${tokenURI}`);
  } catch (e) {
    console.log(` - Token URI: Error retrieving URI`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });