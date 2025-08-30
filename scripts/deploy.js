const hre = require("hardhat");

async function main() {
  const InvestorVerification = await hre.ethers.getContractFactory("InvestorVerification");
  const investorVerification = await InvestorVerification.deploy();
  await investorVerification.waitForDeployment();

  console.log("InvestorVerification deployed to:", await investorVerification.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
