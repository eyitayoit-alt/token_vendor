pragma solidity ^0.8.27;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EontToken is ERC20 {
    constructor() ERC20("Eont", "EONT") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}
