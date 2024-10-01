import Web3 from "web3";
import { AbiItem } from "web3-utils";
import * as fs from "fs";
import path from "path";
import "dotenv/config";

// Loads your provider URL (e.g., from Infura or Alchemy)
const providerURL = process.env.PROVIDER_URL;
const web3 = new Web3(new Web3.providers.HttpProvider(providerURL));

// Load wallet private key and account address
const privateKey = process.env.PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Read the compiled contract ABI and Bytecode
const contractPath = path.resolve(
  "./artifacts/contracts/EontToken.sol/EontToken.json"
);
const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));

const deploy = async () => {
  const accounts = await web3.eth.getAccounts(); // Get available accounts

  console.log("Deploying contract from account:", account.address);

  const EontToken = new web3.eth.Contract(contractJSON.abi);
  const gasPrice = await web3.eth.getGasPrice();
  const deployedContract = await EontToken.deploy({
    data: contractJSON.bytecode,
  }).send({
    from: account.address,
    gasPrice: gasPrice, // Set lower gas price here
    gas: "3000000", // Set a reasonable gas limit
  });

  console.log("EontToken deployed to:", deployedContract.options.address);
};

deploy().catch((error) => {
  console.error("Error deploying contract:", error);
});
