import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy EontToken
  const EontToken = await ethers.getContractFactory("EontToken");
  const eontToken = await EontToken.deploy();
  const eontTokenAddress = await eontToken.getAddress();
  console.log("EontToken deployed at:", eontTokenAddress);

  // Deploy Vendor with EontToken address
  const Vendor = await ethers.getContractFactory("Vendor");
  const vendor = await Vendor.deploy(eontTokenAddress);
  const vendorAddress = await vendor.getAddress();
  console.log("Vendor deployed at:", vendorAddress);
}

main().catch((error) => {
  console.error("Error deploying contracts:", error);
  process.exit(1);
});
