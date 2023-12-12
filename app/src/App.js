// src/App.js
import React, { useState, useEffect } from 'react';
import getWeb3 from './Web3Client';
import TokenExchange from './TokenExchange';
import MockExchange from './contracts/MockExchange.json'; // Adjust with the correct path

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = MockExchange.networks[networkId];
        const contract = new web3.eth.Contract(
          MockExchange.abi,
          deployedNetwork && deployedNetwork.address,
        );

        setWeb3(web3);
        setAccounts(accounts);
        setContract(contract);
      } catch (error) {
        alert('Failed to load web3, accounts, or contract. Check console for details.');
        console.error(error);
      }
    };

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
