// TokenExchange.js
import React, { useState, useEffect } from 'react';
import web3 from './Web3Client';

const TokenExchange = () => {
    const [tokens, setTokens] = useState(['TokenA', 'TokenB', 'TokenC']); // Token names or symbols
    const [selectedToken, setSelectedToken] = useState('TokenA');
    const [amount, setAmount] = useState(''); // State to hold the amount
    const [contract, setContract] = useState(null);

    // Smart contract details
    const contractAddress = 'YOUR_CONTRACT_ADDRESS';
    const contractABI = []; // Your contract ABI

    useEffect(() => {
        // Initialize contract
        const initContract = new web3.eth.Contract(contractABI, contractAddress);
        setContract(initContract);
    }, []);

    const handleTokenChange = (e) => {
        setSelectedToken(e.target.value);
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const executeTrade = async () => {
        if (!contract) return;

        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.error('No accessible accounts');
            return;
        }

        // Example function call: adjust based on your contract
        contract.methods.tradeToken(selectedToken, web3.utils.toWei(amount, 'ether'))
            .send({ from: accounts[0] })
            .then(result => {
                console.log('Trade successful', result);
            })
            .catch(error => {
                console.error('Trade failed', error);
            });
    };

    return (
        <div>
            <h2>Token Exchange</h2>
            <select value={selectedToken} onChange={handleTokenChange}>
                {tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                ))}
            </select>
            <input type="text" value={amount} onChange={handleAmountChange} />
            <button onClick={executeTrade}>Trade</button>
        </div>
    );
};

export default TokenExchange;
