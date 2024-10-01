import { ethers } from "hardhat";
import { expect, assert } from "chai";

describe("EontToken", function () {
  let EontToken, eontToken, owner, addr1, addr2, addrs;

  beforeEach(async function () {
    // Get the contract factory and deploy a new instance before each test
    EontToken = await ethers.getContractFactory("EontToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    eontToken = await EontToken.deploy();
  });

  it("should have correct name and symbol", async function () {
    expect(await eontToken.name()).to.equal("Eont");
    expect(await eontToken.symbol()).to.equal("EONT");
  });

  it("should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await eontToken.balanceOf(owner.address);
    expect(await eontToken.totalSupply()).to.equal(ownerBalance);
  });

  it("should transfer tokens between accounts", async function () {
    // Transfer 50 tokens from owner to addr1
    await eontToken.transfer(addr1.address, 50);
    const addr1Balance = await eontToken.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    await eontToken.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await eontToken.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  it("should fail if sender doesn’t have enough tokens", async function () {
    const initialOwnerBalance = await eontToken.balanceOf(owner.address);

    // Try to send 1 token from addr1 (0 tokens) to owner (should fail)
    await expect(eontToken.connect(addr1).transfer(owner.address, 1)).to.be
      .reverted;

    // Owner balance shouldn't have changed
    expect(await eontToken.balanceOf(owner.address)).to.equal(
      initialOwnerBalance
    );
  });
});
