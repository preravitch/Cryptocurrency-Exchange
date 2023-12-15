// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockBTC is ERC20, Ownable {
    constructor() ERC20("Bitcoin", "BTC") {}

    function mintToExchange(address exchangeAddress, uint256 amount) public onlyOwner {
        _mint(exchangeAddress, amount);
    }
}

contract MockUSDT is ERC20, Ownable {
    constructor() ERC20("Tether", "USDT") {}

    function mintToExchange(address exchangeAddress, uint256 amount) public onlyOwner {
        _mint(exchangeAddress, amount);
    }
}
