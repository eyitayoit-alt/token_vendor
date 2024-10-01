import Web3 from "web3";
import { AbiItem } from "web3-utils";
import * as fs from "fs";
import path from "path";
import { expect } from "chai";
import "dotenv/config";

// Connect to Sepolia using Infura
const web3 = new Web3("http://127.0.0.1:8545/");

// Load contract ABIs
const tokenPath = path.resolve(
  "./artifacts/contracts/EontToken.sol/EontToken.json"
);
const tokenJSON = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
const tokenABI = tokenJSON.abi;
const tokenBytecode = tokenJSON.bytecode;

const vendorPath = path.resolve("./artifacts/contracts/Vendor.sol/Vendor.json");
const vendorJSON = JSON.parse(fs.readFileSync(vendorPath, "utf8"));
const vendorABI = vendorJSON.abi;
const vendorBytecode = vendorJSON.bytecode;

describe("Vendor Contract with EontToken Deployment", function () {
  let accounts;
  let owner, buyer;
  let EontToken, Vendor;
  let tokenAddress, vendorAddress;

  before(async function () {
    // Get available accounts from web3
    accounts = await web3.eth.getAccounts();
    owner = accounts[0]; // Deployer
    buyer = accounts[1]; // Another user

    // Deploy EontToken contract
    const eontTokenContract = new web3.eth.Contract(tokenABI);
    const eontTokenDeployment = await eontTokenContract
      .deploy({
        data: tokenBytecode,
      })
      .send({
        from: owner,
        gas: "5000000",
      });
    tokenAddress = eontTokenDeployment.options.address;
    console.log(`EontToken deployed at: ${tokenAddress}`);

    // Deploy Vendor contract with EontToken's address
    const vendorContract = new web3.eth.Contract(vendorABI);
    const vendorDeployment = await vendorContract
      .deploy({
        data: vendorBytecode,
        arguments: [tokenAddress], // Pass EontToken address to Vendor's constructor
      })
      .send({
        from: owner,
        gas: "5000000",
      });
    vendorAddress = vendorDeployment.options.address;
    console.log(`Vendor deployed at: ${vendorAddress}`);

    // Initialize contract instances for further use
    EontToken = new web3.eth.Contract(tokenABI, tokenAddress);
    Vendor = new web3.eth.Contract(vendorABI, vendorAddress);

    // Transfer some tokens to the Vendor contract
    await EontToken.methods
      .transfer(vendorAddress, web3.utils.toWei("100000", "ether"))
      .send({ from: owner });
  });

  it("should allow the buyer to purchase tokens", async function () {
    // Buyer purchases tokens by sending ETH to the Vendor contract
    await Vendor.methods.buyTokens().send({
      from: buyer,
      value: web3.utils.toWei("0.5", "ether"), // Send 0.5 ETH
      gas: 200000,
    });

    // Check buyer's token balance
    const buyerBalance = await EontToken.methods.balanceOf(buyer).call();
    console.log(`Buyer token balance after buying: ${buyerBalance}`);

    // Assert that the buyer received tokens
    expect(Number(buyerBalance)).to.be.greaterThan(0);
  });

  it("should allow the buyer to sell tokens", async function () {
    // Approve the Vendor to spend buyer's tokens
    const buyerBalanceBeforeSell = await EontToken.methods
      .balanceOf(buyer)
      .call();
    console.log(
      `Buyer token balance Before selling: ${buyerBalanceBeforeSell}`
    );
    await EontToken.methods
      .approve(vendorAddress, web3.utils.toWei("500", "ether"))
      .send({ from: buyer });

    // Buyer sells tokens back to the Vendor
    await Vendor.methods
      .sellTokens(web3.utils.toWei("500", "ether"))
      .send({ from: buyer, gas: 200000 });

    // Check buyer's token balance after selling
    const buyerBalanceAfterSell = await EontToken.methods
      .balanceOf(buyer)
      .call();
    console.log(`Buyer token balance after selling: ${buyerBalanceAfterSell}`);

    // Assert that the buyer's balance decreased after selling tokens
    expect(Number(buyerBalanceAfterSell)).to.be.lessThan(
      Number(buyerBalanceBeforeSell)
    );
  });

  it("should allow the owner to withdraw ETH", async function () {
    // Owner checks balance before withdraw
    const ownerInitialEthBalance = await web3.eth.getBalance(owner);

    // Owner withdraws ETH from the Vendor contract
    await Vendor.methods.withdraw().send({ from: owner, gas: 200000 });

    // Check owner balance after withdrawal
    const ownerFinalEthBalance = await web3.eth.getBalance(owner);
    console.log(`Owner balance after withdraw: ${ownerFinalEthBalance}`);

    // Assert that owner has more ETH after withdrawal
    expect(Number(ownerFinalEthBalance)).to.be.greaterThan(
      Number(ownerInitialEthBalance)
    );
  });
});
