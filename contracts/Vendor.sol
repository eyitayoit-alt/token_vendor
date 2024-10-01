// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EontToken.sol";

contract Vendor is Ownable {
    event BuyTokens(
        address indexed buyer,
        uint256 amountOfETH,
        uint256 amountOfTokens
    );
    event SellTokens(
        address indexed seller,
        uint256 amountOfTokens,
        uint256 amountOfETH
    );

    EontToken public eontToken;
    uint256 public constant tokensPerEth = 2000;

    constructor(address tokenAddress) Ownable(msg.sender) {
        eontToken = EontToken(tokenAddress);
    }

    // A payable function that allows users to buy tokens
    function buyTokens() external payable {
        require(msg.value > 0, "You need to send some ETH");

        uint256 tokenAmount = msg.value * tokensPerEth;
        require(
            eontToken.balanceOf(address(this)) >= tokenAmount,
            "Vendor contract does not have enough tokens"
        );

        eontToken.transfer(msg.sender, tokenAmount);
        emit BuyTokens(msg.sender, msg.value, tokenAmount);
    }

    // A withdraw() function that lets the owner withdraw ETH
    function withdraw() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No ETH to withdraw");

        (bool success, ) = msg.sender.call{value: contractBalance}("");
        require(success, "Withdraw failed");
    }

    // A function that allows a user to sell their tokens back for ETH
    function sellTokens(uint256 tokenAmount) external {
        require(
            tokenAmount > 0,
            "Amount of tokens to sell must be greater than 0"
        );

        uint256 ethAmount = tokenAmount / tokensPerEth;
        require(
            address(this).balance >= ethAmount,
            "Vendor contract does not have enough ETH"
        );

        eontToken.transferFrom(msg.sender, address(this), tokenAmount);
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit SellTokens(msg.sender, tokenAmount, ethAmount);
    }

    // A function to check the token balance of any address
    function getTokenBalance(address wallet) external view returns (uint256) {
        return eontToken.balanceOf(wallet);
    }
}
