import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const API_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    hardhat: {},
    localhost: {
      url: process.env.PROVIDER_URL_DEV,
      accounts: [`${process.env.PRIVATE_KEY_DEV}`],
    },
    sepolia: {
      url: API_URL,
      accounts: [`${PRIVATE_KEY}`],
    },
  },
};

export default config;
