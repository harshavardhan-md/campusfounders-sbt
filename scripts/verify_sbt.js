// scripts/verify_sbt.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddr = process.env.CONTRACT_SBT_ADDRESS;
  console.log("🔍 Checking SBT Contract:", contractAddr);
  console.log("🌐 Network:", hre.network.name);
  
  const InvestorSBT = await hre.ethers.getContractFactory("InvestorSBT");
  const sbt = InvestorSBT.attach(contractAddr);

  // Test addresses
  const addresses = [
    "0xc24d56F9887e3a39fABd42706E91712C145b138f", // Core wallet (issuer)
    "0xb39Ebd4AD032A4758F6876E2Cc26240692F20a5D"  // MetaMask wallet
  ];

  console.log("\n📊 SBT Status Report:");
  console.log("=" .repeat(50));

  for (const address of addresses) {
    console.log(`\n👤 Address: ${address}`);
    
    try {
      // Check token ID
      const tokenId = await sbt.tokenOf(address);
      console.log(`   Token ID: ${tokenId.toString()}`);
      
      if (tokenId.toString() !== "0") {
        // Has SBT - get details
        const isValid = await sbt.isValid(tokenId);
        const isVerified = await sbt.isVerifiedInvestor(address);
        const credential = await sbt.credentialOf(tokenId);
        
        console.log(`   ✅ Has SBT: Token #${tokenId}`);
        console.log(`   📍 Valid: ${isValid}`);
        console.log(`   🔍 Verified: ${isVerified}`);
        console.log(`   📄 Credential Hash: ${credential.credentialHash}`);
        console.log(`   ⏰ Issued: ${new Date(Number(credential.issuedAt) * 1000).toLocaleString()}`);
        console.log(`   📝 URI: ${credential.uri}`);
        console.log(`   🚫 Revoked: ${credential.revoked}`);
        
        // Try to get token URI
        try {
          const tokenURI = await sbt.tokenURI(tokenId);
          console.log(`   🔗 Token URI: ${tokenURI}`);
        } catch (uriError) {
          console.log(`   ❌ Token URI Error: ${uriError.message}`);
        }
        
      } else {
        console.log(`   ❌ No SBT found`);
      }
      
    } catch (error) {
      console.log(`   💥 Error checking address: ${error.message}`);
    }
  }

  // Check contract info
  console.log("\n🏗️ Contract Information:");
  console.log("=" .repeat(30));
  
  try {
    const name = await sbt.name();
    const symbol = await sbt.symbol();
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    
    // Check roles
    const [signer] = await hre.ethers.getSigners();
    const DEFAULT_ADMIN_ROLE = await sbt.DEFAULT_ADMIN_ROLE();
    const ISSUER_ROLE = await sbt.ISSUER_ROLE();
    
    const isAdmin = await sbt.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
    const isIssuer = await sbt.hasRole(ISSUER_ROLE, signer.address);
    
    console.log(`   Signer: ${signer.address}`);
    console.log(`   Is Admin: ${isAdmin}`);
    console.log(`   Is Issuer: ${isIssuer}`);
    
  } catch (contractError) {
    console.log(`   💥 Contract Error: ${contractError.message}`);
  }

  console.log("\n" + "=" .repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Script Error:", err);
    process.exit(1);
  });