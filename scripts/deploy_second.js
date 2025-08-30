const hre = require("hardhat");

async function main() {
  const [deployer, secondAccount] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);
  console.log("Second account:", secondAccount.address);

  const InvestorVerification = await hre.ethers.getContractFactory("InvestorVerification", deployer);
  const contract = await InvestorVerification.deploy();

  await contract.waitForDeployment();

  console.log("InvestorVerification deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
