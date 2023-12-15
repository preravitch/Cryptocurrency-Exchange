import React from 'react';

const TokenLiquidity = ({ web3, platformTokenBalances, userTokenBalances }) => {
    return (
        <div>
            <h2>Platform Token Liquidity</h2>
            <ul>
                {Object.entries(platformTokenBalances).map(([token, balance]) => (
                    <li key={token + "_platform"}>{token} (Platform): {web3.utils.fromWei(balance, 'ether')}</li>
                ))}
            </ul>
            <h2>User Token Balances</h2>
            <ul>
                {Object.entries(userTokenBalances).map(([token, balance]) => (
                    <li key={token + "_user"}>{token} (User): {web3.utils.fromWei(balance, 'ether')}</li>
                ))}
            </ul>
        </div>
    );
};

export default TokenLiquidity;
