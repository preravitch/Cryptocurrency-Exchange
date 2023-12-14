// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MockExchange {
    mapping(string => address) private tokenAddresses;

    event Trade(address indexed user, string tokenFrom, string tokenTo, uint256 amountFrom, uint256 amountTo);
    event EthTrade(address indexed user, string tokenSymbol, uint256 ethAmount, uint256 tokenAmount, bool isEthToToken);

    constructor(address _mockBTC, address _mockUSDT) {
        tokenAddresses["BTC"] = _mockBTC;
        tokenAddresses["USDT"] = _mockUSDT;
    }

    function setTokenAddress(string memory tokenSymbol, address tokenAddress) public {
        tokenAddresses[tokenSymbol] = tokenAddress;
    }

    function trade(string memory tokenFrom, string memory tokenTo, uint256 amountFrom, uint256 amountTo) public {
        address fromTokenAddress = tokenAddresses[tokenFrom];
        address toTokenAddress = tokenAddresses[tokenTo];

        require(fromTokenAddress != address(0) && toTokenAddress != address(0), "Token address not set");

        IERC20(fromTokenAddress).transferFrom(msg.sender, address(this), amountFrom);
        IERC20(toTokenAddress).transfer(msg.sender, amountTo);

        emit Trade(msg.sender, tokenFrom, tokenTo, amountFrom, amountTo);
    }

    // Trade ETH for a Token
    function tradeEthForToken(string memory tokenSymbol, uint256 tokenAmount) external payable {
        address tokenAddress = tokenAddresses[tokenSymbol];
        require(tokenAddress != address(0), "Token address not set");

        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);

        emit EthTrade(msg.sender, tokenSymbol, msg.value, tokenAmount, true);
    }

    // Trade a Token for ETH
    function tradeTokenForEth(string memory tokenSymbol, uint256 tokenAmount, uint256 ethAmount) external {
        address tokenAddress = tokenAddresses[tokenSymbol];
        require(tokenAddress != address(0), "Token address not set");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
        payable(msg.sender).transfer(ethAmount);

        emit EthTrade(msg.sender, tokenSymbol, ethAmount, tokenAmount, false);
    }

    // Function to receive ETH
    receive() external payable {}
}
