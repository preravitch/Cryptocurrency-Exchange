// src/App.js
import React, { useState, useEffect } from 'react'
import getWeb3 from './Web3Client'
import TokenExchange from './TokenExchange'
import MockExchange from './artifacts/contracts/MockExchange.sol/MockExchange.json'
import TokenLiquidity from './TokenLiquidity';

function App () {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)
  const platformAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508';
  const contractAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508';
  const [platformTokenBalances, setPlatformTokenBalances] = useState({});
  const [userTokenBalances, setUserTokenBalances] = useState({});

  const tokenAddresses = {
      "BTC": "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
      "USDT": "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"
  };

  const erc20Abi = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
  ];


  const updateTokenBalances = async () => {
    if (!web3 || !accounts || !contract) {
        console.error("Web3, accounts, or contract not initialized");
        return;
    }

    const platformBalances = {};
    const userBalances = {};

    // Fetch ETH balance for the platform and user
    platformBalances['ETH'] = await web3.eth.getBalance(platformAddress);
    userBalances['ETH'] = await web3.eth.getBalance(accounts[0]);

    // Fetch balances for other tokens
    for (const [symbol, address] of Object.entries(tokenAddresses)) {
        const tokenContract = new web3.eth.Contract(erc20Abi, address);
        platformBalances[symbol] = await tokenContract.methods.balanceOf(platformAddress).call();
        userBalances[symbol] = await tokenContract.methods.balanceOf(accounts[0]).call();
    }

    setPlatformTokenBalances(platformBalances);
    setUserTokenBalances(userBalances);
  };

  const initWeb3 = async () => {
    try {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        const contractInstance = new web3Instance.eth.Contract(MockExchange.abi, contractAddress);

        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(contractInstance);
    } catch (error) {
        console.error('Error in initWeb3:', error);
        alert('Failed to load web3, accounts, or contract. Check console for details.');
    }
  };

  useEffect(() => {
    initWeb3();
  }, []);

  useEffect(() => {
    if (web3 && accounts && contract) {
        updateTokenBalances();
    }
  }, [web3, accounts, contract]);

  return (
    <div>
      <h1>Crypto Exchange</h1>
      {web3 && accounts && contract
        ? (
          <>
              <TokenExchange 
                  web3={web3} 
                  accounts={accounts} 
                  contract={contract}
                  tokenAddresses={tokenAddresses}
                  updateTokenBalances={updateTokenBalances}
                  platformTokenBalances={platformTokenBalances}
                  userTokenBalances={userTokenBalances}
              />
              <TokenLiquidity 
                  web3={web3} 
                  platformTokenBalances={platformTokenBalances}
                  userTokenBalances={userTokenBalances}
              />

          </>
      )
        : (
        <button onClick={initWeb3}>Connect Wallet</button>
        //เพิ่ม show เลขกระเป๋าที่เชื่อม
          )}
    </div>
  )
}

export default App
