// scripts/mint_sbt.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [issuer, investor] = await hre.ethers.getSigners();

  const contractAddr = process.env.CONTRACT_SBT_ADDRESS; // SBT contract address
  const InvestorSBT = await hre.ethers.getContractFactory("InvestorSBT");
  const sbt = InvestorSBT.attach(contractAddr);

  console.log("Issuer:", issuer.address);
  console.log("Investor:", investor.address);

  // Check if investor already has a token
  const existingToken = await sbt.tokenOf(investor.address);
  if (existingToken.toString() !== "0") {
    console.log(`❌ Investor already has token ID: ${existingToken}`);
    return;
  }

  // Example metadata
  const credentialHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("VerifiedInvestor_KYC123")
  );
  const expiresAt = Math.floor(Date.now() / 1000) + 365 * 24 * 3600; // 1 year
  const uri = "ipfs://example_hash_of_json_metadata";

  console.log("Minting SBT...");
  const tx = await sbt.connect(issuer).mint(investor.address, credentialHash, expiresAt, uri);
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
    console.log(`✅ SBT minted to investor! Token ID: ${parsedEvent.args.tokenId}`);
  } else {
    // Fallback: get token ID from mapping
    const tokenId = await sbt.tokenOf(investor.address);
    console.log(`✅ SBT minted to investor! Token ID: ${tokenId}`);
  }

  // Verify the token
  const isValid = await sbt.isValid(await sbt.tokenOf(investor.address));
  console.log(`Token is valid: ${isValid}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });