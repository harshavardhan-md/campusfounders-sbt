// scripts/deploy_sbt.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const issuerAddress = deployer.address; // simple: deployer is issuer
  const SBT = await hre.ethers.getContractFactory("InvestorSBT");
  const sbt = await SBT.deploy(issuerAddress);
  await sbt.waitForDeployment();

  console.log("InvestorSBT deployed to:", await sbt.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
