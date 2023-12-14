import React, { useState } from 'react';

const TokenExchange = ({ web3, accounts, contract }) => {
    const [fromToken, setFromToken] = useState('ETH');
    const [toToken, setToToken] = useState('BTC');
    const [amount, setAmount] = useState(0);
    const [calculatedAmount, setCalculatedAmount] = useState(0);

    const tokenValues = {
        "ETH": { "BTC": 0.07, "USDT": 3000 },
        "BTC": { "ETH": 14, "USDT": 40000 },
        "USDT": { "ETH": 0.0003, "BTC": 0.000025 }
    };

    const handleFromTokenChange = (e) => {
        setFromToken(e.target.value);
        updateExchangeRate(e.target.value, toToken);
    };

    const handleToTokenChange = (e) => {
        setToToken(e.target.value);
        updateExchangeRate(fromToken, e.target.value);
    };

    const handleAmountChange = (e) => {
        const inputAmount = e.target.value;
        setAmount(inputAmount);
        const rate = tokenValues[fromToken][toToken] || 0;
        setCalculatedAmount(inputAmount * rate);
    };

    const updateExchangeRate = (from, to) => {
        const rate = tokenValues[from][to] || 0;
        setCalculatedAmount(amount * rate);
    };

    const executeTrade = async () => {
        if (!contract) return;

        try {
            if (fromToken === 'ETH') {
                // Trading ETH for a token
                await contract.methods.tradeEthForToken(toToken, calculatedAmount)
                    .send({ from: accounts[0], value: web3.utils.toWei(amount.toString(), 'ether') });
            } else if (toToken === 'ETH') {
                // Trading a token for ETH
                await contract.methods.tradeTokenForEth(fromToken, web3.utils.toWei(amount.toString(), 'ether'), calculatedAmount)
                    .send({ from: accounts[0] });
            } else {
                // Trading ERC-20 tokens
                await contract.methods.trade(fromToken, toToken, amount, calculatedAmount)
                    .send({ from: accounts[0] });
            }
            alert('Trade executed');
        } catch (error) {
            console.error('Trade execution error:', error);
            alert('Trade failed. See console for details.');
        }
    };

    return (
        <div>
            <h2>Token Exchange</h2>
            <div>
                <label>From: </label>
                <select value={fromToken} onChange={handleFromTokenChange}>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                </select>
                <input type="number" value={amount} onChange={handleAmountChange} />
            </div>
            <div>
                <label>To: </label>
                <select value={toToken} onChange={handleToTokenChange}>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                </select>
                <input type="text" value={calculatedAmount} readOnly />
            </div>
            <button onClick={executeTrade}>Trade</button>
        </div>
    );
};

export default TokenExchange;
