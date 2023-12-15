import React, { useState } from 'react';
import BN from 'bn.js';

const TokenExchange = ({ web3, accounts, contract, tokenAddresses, updateTokenBalances, platformTokenBalances, userTokenBalances }) => {
    const [fromToken, setFromToken] = useState('ETH');
    const [toToken, setToToken] = useState('BTC');
    const [amount, setAmount] = useState(0);
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [calculatedAmountforshow, setCalculatedAmountforshow] = useState(0);
    const [userBalanceWarning, setUserBalanceWarning] = useState('');
    const [platformBalanceWarning, setPlatformBalanceWarning] = useState('');

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
        const tokenAddress = tokenAddresses[tokenSymbol];
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        return await tokenContract.methods.allowance(owner, spender).call();
    };

    const setAllowance = async (tokenSymbol, spender, amount) => {
        const tokenAddress = tokenAddresses[tokenSymbol];
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        await tokenContract.methods.approve(spender, amount).send({ from: accounts[0] });
    };
    
    const tokenValues = {
        "ETH": { "BTC": 0.07, "USDT": 3000 },
        "BTC": { "ETH": 14, "USDT": 40000 },
        "USDT": { "ETH": 1/3000, "BTC": 1/40000 }
    };

    const checkBalances = (fromToken, toToken, fromAmount, toAmount) => {
        setUserBalanceWarning('');
        setPlatformBalanceWarning('');
    
        // Check user balance for the 'from' token
        const fromTokenBalance = fromToken === 'ETH' ? 
            userTokenBalances['ETH'] : 
            userTokenBalances[fromToken];
        if (new BN(fromTokenBalance).lt(new BN(web3.utils.toWei(fromAmount.toString(), 'ether')))) {
            setUserBalanceWarning('Insufficient user balance for the trade.');
        }
    
        // Check platform balance for the 'to' token
        const toTokenBalance = toToken === 'ETH' ? 
            platformTokenBalances['ETH'] : 
            platformTokenBalances[toToken];
        if (new BN(toTokenBalance).lt(new BN(toAmount))) {
            setPlatformBalanceWarning('Insufficient platform balance for the trade.');
        }
    };

    const handleFromTokenChange = (e) => {
        setFromToken(e.target.value);
        updateExchangeRate(e.target.value, toToken);
        checkBalances(e.target.value, toToken, amount, calculatedAmountforshow);
    };

    const handleToTokenChange = (e) => {
        setToToken(e.target.value);
        updateExchangeRate(fromToken, e.target.value);
        checkBalances(fromToken, e.target.value, amount, calculatedAmountforshow);
    };

    const handleAmountChange = (e) => {
        const inputAmount = e.target.value;
        setAmount(inputAmount);
        updateExchangeRate(fromToken, toToken, inputAmount);

        setUserBalanceWarning('');
        setPlatformBalanceWarning('');

        checkBalances(fromToken, toToken, inputAmount, calculatedAmountforshow);
    
    };

    const updateExchangeRate = (from, to, inputAmount = amount) => {
        const rate = tokenValues[from][to] || 0;
        const calculated = inputAmount * rate * Math.pow(10, 18); // Assuming 18 decimals for simplicity
        setCalculatedAmount(calculated);
        const show = calculated / Math.pow(10, 18);
        setCalculatedAmountforshow(show)
    };

    const handleSwapButtonClick = () => {
        const tempFromToken = fromToken;
        const tempToToken = toToken;
        const tempAmount = amount;
        const tempCalculatedAmountForShow = calculatedAmountforshow;

        setFromToken(tempToToken);
        setToToken(tempFromToken);
        setAmount(tempCalculatedAmountForShow);
        setCalculatedAmountforshow(tempAmount);

        // Reset warnings
        setUserBalanceWarning('');
        setPlatformBalanceWarning('');

        checkBalances(tempToToken, tempFromToken, tempCalculatedAmountForShow, tempAmount);
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
            await updateTokenBalances();
        } catch (error) {
            console.error('Trade execution error:', error);
            alert('Trade failed. See console for details.');
        }
    };

    return (
        <div>
            <h2>Token Exchange</h2>
            <div>
                {userBalanceWarning && <p style={{ color: 'red' }}>{userBalanceWarning}</p>}
                <label>From: </label>
                <select value={fromToken} onChange={handleFromTokenChange}>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                </select>
                <input type="number" value={amount} onChange={handleAmountChange} />
            </div>
            <button onClick={handleSwapButtonClick}>Switch</button>
            <div>
                <label>To: </label>
                <select value={toToken} onChange={handleToTokenChange}>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                </select>
                <input type="text" value={calculatedAmountforshow} readOnly />
                {platformBalanceWarning && <p style={{ color: 'red' }}>{platformBalanceWarning}</p>}
            </div>
            <button onClick={executeTrade}>Swap</button>
        </div>
    );
};

export default TokenExchange;
