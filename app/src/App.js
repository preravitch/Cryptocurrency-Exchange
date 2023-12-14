// src/App.js
import React, { useState, useEffect } from 'react';
import getWeb3 from './Web3Client';
import TokenExchange from './TokenExchange';
import MockExchange from './artifacts/contracts/MockExchange.sol/MockExchange.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);

  const initWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Replace with your contract's address
      const contract = new web3.eth.Contract(MockExchange.abi, contractAddress);

      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
    } catch (error) {
      console.error("Error in initWeb3:", error);
      alert('Failed to load web3, accounts, or contract. Check console for details.');
    }
  };
  
  

  useEffect(() => {
    initWeb3();
  }, []);

  return (
    <div>
      <h1>Crypto Exchange</h1>
      {web3 && accounts && contract ? (
        <TokenExchange web3={web3} accounts={accounts} contract={contract} />
      ) : (
        <button onClick={initWeb3}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
