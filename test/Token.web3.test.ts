import Web3 from "web3";
import { AbiItem } from "web3-utils";
import * as fs from "fs";
import path from "path";
import "dotenv/config";
import { expect, assert } from "chai";

// Loads your provider URL (e.g., from Infura or Alchemy)
const providerURL = process.env.PROVIDER_URL;
const web3 = new Web3("http://127.0.0.1:8545/");

// Read the compiled contract ABI and Bytecode
const contractPath = path.resolve(
  "./artifacts/contracts/EontToken.sol/EontToken.json"
);
const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));

let accounts;
let eontToken;

describe("EontToken", function () {
  before(async function () {
    accounts = await web3.eth.getAccounts();

    const EontToken = new web3.eth.Contract(contractJSON.abi);

    eontToken = await EontToken.deploy({
      data: contractJSON.bytecode,
    }).send({
      from: accounts[0],
      gas: "3000000", // Adjust gas limit as needed
    });
  });

  it("should have correct name and symbol", async function () {
    const name = await eontToken.methods.name().call();
    const symbol = await eontToken.methods.symbol().call();
    assert.equal(name, "Eont");
    assert.equal(symbol, "EONT");
  });

  it("should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await eontToken.methods.balanceOf(accounts[0]).call();
    const totalSupply = await eontToken.methods.totalSupply().call();
    assert.equal(ownerBalance, totalSupply);
  });

  it("should transfer tokens between accounts", async function () {
    // Transfer 50 tokens from owner to accounts[1]
    await eontToken.methods
      .transfer(accounts[1], 50)
      .send({ from: accounts[0] });

    const balance1 = await eontToken.methods.balanceOf(accounts[1]).call();
    assert.equal(balance1, 50);

    // Transfer 50 tokens from accounts[1] to accounts[2]
    await eontToken.methods
      .transfer(accounts[2], 50)
      .send({ from: accounts[1] });

    const balance2 = await eontToken.methods.balanceOf(accounts[2]).call();
    assert.equal(balance2, 50);
  });

  it("should fail if sender doesn’t have enough tokens", async function () {
    // Attempt to transfer more tokens than available in accounts[1]
    await expect(
      eontToken.methods.transfer(accounts[0], 100).send({ from: accounts[1] })
    ).to.be.rejected;
  });
});
