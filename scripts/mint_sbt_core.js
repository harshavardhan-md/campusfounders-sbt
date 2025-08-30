// scripts/mint_sbt_core.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [issuer] = await hre.ethers.getSigners();
  
  // Explicitly set the Core Wallet address as recipient
  const coreWalletAddress = "0xc24d56F9887e3a39fABd42706E91712C145b138f";

  const contractAddr = process.env.CONTRACT_SBT_ADDRESS; // SBT contract address
  const InvestorSBT = await hre.ethers.getContractFactory("InvestorSBT");
  const sbt = InvestorSBT.attach(contractAddr);

  console.log("Issuer:", issuer.address);
  console.log("Target Investor (Core Wallet):", coreWalletAddress);

  // Check if Core Wallet already has a token
  const existingToken = await sbt.tokenOf(coreWalletAddress);
  if (existingToken.toString() !== "0") {
    console.log(`❌ Core Wallet already has token ID: ${existingToken}`);
    return;
  }

  // Example metadata
  const credentialHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("VerifiedInvestor_CoreWallet_KYC456")
  );
  const expiresAt = Math.floor(Date.now() / 1000) + 365 * 24 * 3600; // 1 year
  const uri = "ipfs://example_hash_of_json_metadata_core";

  console.log("Minting SBT for Core Wallet...");
  const tx = await sbt.connect(issuer).mint(coreWalletAddress, credentialHash, expiresAt, uri);
  console.log("Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);

  // Parse events properly for newer ethers.js
  const mintEvent = receipt.logs.find(log => {
    try {
      const parsedLog = sbt.interface.parseLog(log);
      return parsedLog.name === 'Minted';
    } catch (e) {
      return false;
    }
  });

  if (mintEvent) {
    const parsedEvent = sbt.interface.parseLog(mintEvent);
    console.log(`✅ SBT minted to Core Wallet! Token ID: ${parsedEvent.args.tokenId}`);
  } else {
    // Fallback: get token ID from mapping
    const tokenId = await sbt.tokenOf(coreWalletAddress);
    console.log(`✅ SBT minted to Core Wallet! Token ID: ${tokenId}`);
  }

  // Verify the token
  const isValid = await sbt.isValid(await sbt.tokenOf(coreWalletAddress));
  console.log(`Token is valid: ${isValid}`);
  
  console.log("\n🎯 Next steps:");
  console.log("1. Switch to Core Wallet in your dApp");
  console.log("2. Refresh the platform");
  console.log("3. Check Mentor Dashboard - should show 4 milestones!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });