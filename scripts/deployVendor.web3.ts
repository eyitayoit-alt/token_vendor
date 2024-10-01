import Web3 from "web3";
import { AbiItem } from "web3-utils";
import * as fs from "fs";
import path from "path";
import "dotenv/config";

// Connect to the network (use Infura, Alchemy, or other RPC providers)
const web3 = new Web3("https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID");

// Load the compiled contract artifacts
const tokenPath = path.resolve(
  "./artifacts/contracts/EontToken.sol/EontToken.json"
);
const tokenJSON = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
const vendorPath = path.resolve("./artifacts/contracts/Vendor.sol/Vendor.json");
const vendorJSON = JSON.parse(fs.readFileSync(vendorPath, "utf8"));


const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];

  console.log(`Deploying contracts with account: ${deployer}`);

  // Deploy EontToken contract
  const EontToken = new web3.eth.Contract(tokenJSON.abi);
  const tokenInstance = await EontToken.deploy({
    data: tokenJSON.bytecode,
  }).send({
    from: deployer,
    gas: "5000000",
    gasPrice: web3.utils.toWei("10", "gwei"),
  });

  console.log(`EontToken deployed at: ${tokenInstance.options.address}`);

  // Deploy Vendor contract
  const Vendor = new web3.eth.Contract(vendorJSON.abi);
  const vendorInstance = await Vendor.deploy({
    data: vendorJSON.bytecode,
    arguments: [tokenInstance.options.address], // Pass the token contract address
  }).send({
    from: deployer,
    gas: "5000000",
    gasPrice: web3.utils.toWei("10", "gwei"),
  });

  console.log(`Vendor contract deployed at: ${vendorInstance.options.address}`);
};

deploy().catch((error) => {
  console.error("Error deploying contract:", error);
});
