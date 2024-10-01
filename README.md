# Token Vendor Project

## Project Description

This is a project that mint and vend ERC20 token. It allows a user to purchase and sell tokens.

## Setup

1. Fork the repository.
2. Open your terminal and cd to the project directory.
3. Run `yarn install` or `npm install` to install project dependecies.
4. Create a .env file.

```shell
PRIVATE_KEY = ''
PROVIDER_URL = ''
```

5. Configure your network in `hardhat.config.ts` as shown below:

```json
    const API_URL = process.env.PROVIDER_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const config: HardhatUserConfig = {
    solidity: "0.8.27",
    networks: {
      hardhat: {},
      sepolia: {
        url: API_URL,
        accounts: [`${PRIVATE_KEY}`],
      },
    },
    };
```

6. Change the network settings to your network of choice.

## Tests

Run `npx hardhat test`.
For web3.js test:-

1. Run `npx hardhat node`.
2. Run `npx hardhat test`.

## Deployment

`npx hardhat run script/deployEontToken.ethers.ts` --network <`name of network`>
`npx hardhat run script/deployVendor.ethers.ts` --network <`name of network`>
