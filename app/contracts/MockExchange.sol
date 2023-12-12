// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MockExchange {
    mapping(string => address) private tokenAddresses;

    event Trade(address indexed user, string tokenFrom, string tokenTo, uint256 amountFrom, uint256 amountTo);

    constructor(address _mockBTC, address _mockETH, address _mockUSDT) {
        tokenAddresses["BTC"] = _mockBTC;
        tokenAddresses["ETH"] = _mockETH;
        tokenAddresses["USDT"] = _mockUSDT;
    }

    function setTokenAddress(string memory tokenSymbol, address tokenAddress) public {
        tokenAddresses[tokenSymbol] = tokenAddress;
    }

    function trade(string memory tokenFrom, string memory tokenTo, uint256 amountFrom, uint256 amountTo) public {
        address fromTokenAddress = tokenAddresses[tokenFrom];
        address toTokenAddress = tokenAddresses[tokenTo];

        require(fromTokenAddress != address(0) && toTokenAddress != address(0), "Token address not set");

        // Transfer 'fromToken' from the user to the contract
        IERC20(fromTokenAddress).transferFrom(msg.sender, address(this), amountFrom);

        // Transfer 'toToken' from the contract to the user
        IERC20(toTokenAddress).transfer(msg.sender, amountTo);

        emit Trade(msg.sender, tokenFrom, tokenTo, amountFrom, amountTo);
    }
}
