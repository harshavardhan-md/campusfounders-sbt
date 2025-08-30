const { ethers } = require("hardhat");

async function main() {
  // Load deployer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Your deployed contract address from deploy step
  const contractAddress = "0x05726348b041B94e73Df9268D8787Fa9c2c4409C";

  // Load ABI & attach
  const InvestorVerification = await ethers.getContractFactory("InvestorVerification");
  const contract = InvestorVerification.attach(contractAddress);

  console.log("Loaded contract at:", contract.target || contract.address);

  // Example: call verifyInvestor
  const tx = await contract.verifyInvestor(deployer.address);
await tx.wait();
console.log("Investor verified for:", deployer.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
