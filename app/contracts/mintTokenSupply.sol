// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBTC is ERC20 {
    constructor() ERC20("Bitcoin", "BTC") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million mock BTC for testing
    }
}

contract MockETH is ERC20 {
    constructor() ERC20("Ethereum", "ETH") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million mock ETH for testing
    }
}

contract MockUSDT is ERC20 {
    constructor() ERC20("Tether", "USDT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million mock USDT for testing
    }
}
