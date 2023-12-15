import React, { useState } from 'react';
import BN from 'bn.js';

const TokenExchange = ({ web3, accounts, contract }) => {
    const [fromToken, setFromToken] = useState('ETH');
    const [toToken, setToToken] = useState('BTC');
    const [amount, setAmount] = useState(0);
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [calculatedAmountforshow, setCalculatedAmountforshow] = useState(0);

    const TOKEN_ADDRESSES = {
        "BTC": "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
        "USDT": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" 
    };

    const erc20Abi = [
        {
          "constant": true,
          "inputs": [
            { "name": "_owner", "type": "address" },
            { "name": "_spender", "type": "address" }
          ],
          "name": "allowance",
          "outputs": [{ "name": "", "type": "uint256" }],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            { "name": "_spender", "type": "address" },
            { "name": "_value", "type": "uint256" }
          ],
          "name": "approve",
          "outputs": [{ "name": "", "type": "bool" }],
          "type": "function"
        }
      ];
    
    const checkAllowance = async (tokenSymbol, owner, spender) => {
        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        return await tokenContract.methods.allowance(owner, spender).call();
    };
    
    const setAllowance = async (tokenSymbol, spender, amount) => {
        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        await tokenContract.methods.approve(spender, amount).send({ from: accounts[0] });
    };
    
    const tokenValues = {
        "ETH": { "BTC": 0.07, "USDT": 3000 },
        "BTC": { "ETH": 14, "USDT": 40000 },
        "USDT": { "ETH": 1/3000, "BTC": 1/40000 }
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
        updateExchangeRate(fromToken, toToken, inputAmount);
    };

    const updateExchangeRate = (from, to, inputAmount = amount) => {
        const rate = tokenValues[from][to] || 0;
        const calculated = inputAmount * rate * Math.pow(10, 18); // Assuming 18 decimals for simplicity
        setCalculatedAmount(calculated);
        const show = calculated / Math.pow(10, 18);
        setCalculatedAmountforshow(show)
    };

    
    const executeTrade = async () => {
        if (!contract) return;

        try {
            if (fromToken !== 'ETH') {
                const fromTokenAmount = web3.utils.toWei(amount.toString(), 'ether'); // Adjust this based on the actual decimals of `fromToken`
                const allowance = await checkAllowance(fromToken, accounts[0], contract.options.address);
                if (new BN(allowance).lt(new BN(fromTokenAmount))) {
                    await setAllowance(fromToken, contract.options.address, fromTokenAmount);
                }
            }

            if (fromToken === 'ETH') {
                await contract.methods.tradeEthForToken(toToken, calculatedAmount.toString())
                    .send({ from: accounts[0], value: web3.utils.toWei(amount.toString(), 'ether') });
            } else if (toToken === 'ETH') {
                await contract.methods.tradeTokenForEth(fromToken, web3.utils.toWei(amount.toString(), 'ether'), calculatedAmount.toString())
                    .send({ from: accounts[0] });
            } else {
                await contract.methods.trade(fromToken, toToken, web3.utils.toWei(amount.toString(), 'ether'), calculatedAmount.toString())
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
                <input type="text" value={calculatedAmountforshow} readOnly />
            </div>
            <button onClick={executeTrade}>Trade</button>
        </div>
    );
};

export default TokenExchange;
