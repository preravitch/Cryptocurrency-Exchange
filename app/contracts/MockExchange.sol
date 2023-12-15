// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockExchange is Ownable, ReentrancyGuard {
    mapping(string => address) private tokenAddresses;

    event Trade(address indexed user, string tokenFrom, string tokenTo, uint256 amountFrom, uint256 amountTo);
    event EthTrade(address indexed user, string tokenSymbol, uint256 ethAmount, uint256 tokenAmount, bool isEthToToken);

    constructor(address _mockBTC, address _mockUSDT) {
        tokenAddresses["BTC"] = _mockBTC;
        tokenAddresses["USDT"] = _mockUSDT;
    }

    function setTokenAddress(string memory tokenSymbol, address tokenAddress) public onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        tokenAddresses[tokenSymbol] = tokenAddress;
    }

    function trade(string memory tokenFrom, string memory tokenTo, uint256 amountFrom, uint256 amountTo) public nonReentrant {
        address fromTokenAddress = tokenAddresses[tokenFrom];
        address toTokenAddress = tokenAddresses[tokenTo];

        require(fromTokenAddress != address(0) && toTokenAddress != address(0), "Token address not set");

        IERC20(fromTokenAddress).transferFrom(msg.sender, address(this), amountFrom);
        IERC20(toTokenAddress).transfer(msg.sender, amountTo);

        emit Trade(msg.sender, tokenFrom, tokenTo, amountFrom, amountTo);
    }

    function tradeEthForToken(string memory tokenSymbol, uint256 tokenAmount) external payable nonReentrant {
        address tokenAddress = tokenAddresses[tokenSymbol];
        require(tokenAddress != address(0), "Token address not set");
        require(msg.value > 0, "ETH amount must be greater than 0");

        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);

        emit EthTrade(msg.sender, tokenSymbol, msg.value, tokenAmount, true);
    }

    function tradeTokenForEth(string memory tokenSymbol, uint256 tokenAmount, uint256 ethAmount) external nonReentrant {
        address tokenAddress = tokenAddresses[tokenSymbol];
        require(tokenAddress != address(0), "Token address not set");
        require(address(this).balance >= ethAmount, "Insufficient ETH balance in contract");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(ethAmount);

        emit EthTrade(msg.sender, tokenSymbol, ethAmount, tokenAmount, false);
    }

    receive() external payable {}

    fallback() external payable {}
}
