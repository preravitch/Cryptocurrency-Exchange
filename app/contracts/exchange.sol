// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract TokenExchange {
    // Exchange rates data structure
    struct ExchangeRate {
        uint256 rate; // Exchange rate (tokenB amount per 1 tokenA)
        uint256 decimals; // Decimals to adjust for token precision
    }

    // Mapping of token pairs to their exchange rates
    mapping(address => mapping(address => ExchangeRate)) public exchangeRates;

    // Event to log trades
    event Trade(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB);

    // Set exchange rate
    function setExchangeRate(address tokenA, address tokenB, uint256 rate, uint256 decimals) public {
        exchangeRates[tokenA][tokenB] = ExchangeRate(rate, decimals);
    }

    // Trade tokens
    function trade(address tokenA, address tokenB, uint256 amountA) public {
        ExchangeRate memory rateInfo = exchangeRates[tokenA][tokenB];
        require(rateInfo.rate > 0, "Exchange rate not set");

        uint256 amountB = amountA * rateInfo.rate / (10**rateInfo.decimals);

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);

        emit Trade(msg.sender, tokenA, tokenB, amountA, amountB);
    }
}
