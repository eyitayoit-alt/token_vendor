// scripts/deploy.js
import { ethers } from "hardhat";
async function main() {
  // Get the contract factory
  const EontToken = await ethers.getContractFactory("EontToken");

  // Deploy the contract
  console.log("Deploying EontToken...");
  const eontToken = await EontToken.deploy();
  const contractAddress = await eontToken.getAddress();
  console.log(`EontToken deployed to: ${contractAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
