import { ethers } from "hardhat";
import { expect } from "chai";

describe("Vendor Contract", function () {
  let eontToken, vendor;
  let owner, buyer, vendorAddress;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    // Deploy EontToken
    const EontToken = await ethers.getContractFactory("EontToken");
    eontToken = await EontToken.deploy();
    const eontTokenAddress = await eontToken.getAddress();

    // Deploy Vendor
    const Vendor = await ethers.getContractFactory("Vendor");
    vendor = await Vendor.deploy(eontTokenAddress);
    vendorAddress = await vendor.getAddress();
    // Transfer tokens to vendor contract
    await eontToken.transfer(vendorAddress, ethers.parseUnits("100000", 18));
  });

  it("should allow a user to buy tokens", async function () {
    const buyerInitialBalance = await eontToken.balanceOf(buyer.address);
    expect(buyerInitialBalance).to.equal(0);

    // Buy tokens by sending ETH to the vendor
    await vendor.connect(buyer).buyTokens({ value: ethers.parseEther("1") });

    // Check token balance after purchase
    const buyerBalance = await eontToken.balanceOf(buyer.address);
    const expectedTokens = ethers.parseUnits("2000", 18); // 2000 tokens per 1 ETH
    expect(buyerBalance).to.equal(expectedTokens);
  });

  it("should allow a user to sell tokens", async function () {
    // First buy some tokens
    await vendor.connect(buyer).buyTokens({ value: ethers.parseEther("1") });

    // Approve vendor to spend buyer's tokens
    await eontToken
      .connect(buyer)
      .approve(vendorAddress, ethers.parseUnits("2000", 18));

    // Sell tokens back to vendor
    await vendor.connect(buyer).sellTokens(ethers.parseUnits("2000", 18));

    // Check buyer's token balance after selling
    const buyerBalanceAfterSell = await eontToken.balanceOf(buyer.address);
    expect(buyerBalanceAfterSell).to.equal(0);
  });

  it("should allow owner to withdraw ETH", async function () {
    // Send some ETH to vendor by buying tokens
    await vendor.connect(buyer).buyTokens({ value: ethers.parseEther("1") });

    // Owner withdraws ETH
    const ownerInitialEthBalance = await ethers.provider.getBalance(
      owner.address
    );
    const withdrawTx = await vendor.connect(owner).withdraw();
    const withdrawReceipt = await withdrawTx.wait();

    // Check the gas cost of the withdrawal transaction
    const gasUsed = withdrawReceipt.gasUsed;
    const gasPrice = withdrawTx.gasPrice;
    //const gasCost = gasUsed(gasPrice);

    const ownerEthBalanceAfterWithdraw = await ethers.provider.getBalance(
      owner.address
    );
    expect(ownerEthBalanceAfterWithdraw).to.above(ownerInitialEthBalance);
  });
});
