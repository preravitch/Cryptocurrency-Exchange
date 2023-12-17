// src/App.js
import React, { useState, useEffect } from "react";
import getWeb3 from "./Web3Client";
import TokenExchange from "./TokenExchange";
import MockExchange from "./artifacts/contracts/MockExchange.sol/MockExchange.json";
import TokenLiquidity from "./TokenLiquidity";
import "./App.css";

function App() {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [contract, setContract] = useState(null);
    const platformAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const [platformTokenBalances, setPlatformTokenBalances] = useState({});
    const [userTokenBalances, setUserTokenBalances] = useState({});

    const tokenAddresses = {
        BTC: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        USDT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    };

    const erc20Abi = [
        {
            constant: true,
            inputs: [{ name: "_owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
        },
    ];

    const updateTokenBalances = async () => {
        if (!web3 || !accounts || !contract) {
            console.error("Web3, accounts, or contract not initialized");
            return;
        }

        const platformBalances = {};
        const userBalances = {};

        // Fetch ETH balance for the platform and user
        platformBalances["ETH"] = await web3.eth.getBalance(platformAddress);
        userBalances["ETH"] = await web3.eth.getBalance(accounts[0]);

        // Fetch balances for other tokens
        for (const [symbol, address] of Object.entries(tokenAddresses)) {
            const tokenContract = new web3.eth.Contract(erc20Abi, address);
            platformBalances[symbol] = await tokenContract.methods
                .balanceOf(platformAddress)
                .call();
            userBalances[symbol] = await tokenContract.methods
                .balanceOf(accounts[0])
                .call();
        }

        setPlatformTokenBalances(platformBalances);
        setUserTokenBalances(userBalances);
    };

    const initWeb3 = async () => {
        console.log("pressed");
        try {
            const web3Instance = await getWeb3();
            const accounts = await web3Instance.eth.getAccounts();
            const contractInstance = new web3Instance.eth.Contract(
                MockExchange.abi,
                contractAddress
            );

            setWeb3(web3Instance);
            setAccounts(accounts);
            setContract(contractInstance);
        } catch (error) {
            console.error("Error in initWeb3:", error);
            alert(
                "Failed to load web3, accounts, or contract. Check console for details."
            );
        }
    };

    useEffect(() => {
        if (web3 && accounts && contract) {
            updateTokenBalances();
        }
        initWeb3();
    }, [web3, accounts, contract]);

    return (
        <div>
            <div className="header">
                <strong>CHAISWAP</strong>
                <nav className="header-right">
                    <ul>
                        <li>
                            <a href="/">Trade</a>
                        </li>
                        <li>
                            <a href="/info">Info</a>
                        </li>
                    </ul>
                </nav>
            </div>

            {web3 && accounts && contract ? (
                <div className="content">
                    <div className="leftSection">
                        <TokenLiquidity
                            web3={web3}
                            platformTokenBalances={platformTokenBalances}
                            userTokenBalances={userTokenBalances}
                        />
                        <TokenExchange
                            web3={web3}
                            accounts={accounts}
                            contract={contract}
                            tokenAddresses={tokenAddresses}
                            updateTokenBalances={updateTokenBalances}
                            platformTokenBalances={platformTokenBalances}
                            userTokenBalances={userTokenBalances}
                        />
                    </div>
                    <div className="rightSection">graph</div>
                </div>
            ) : (
                <div className="content">
                    <div className="leftSection">
                        <div>
                            <h1>
                                <span>CHAI</span>SWAP
                            </h1>
                            <h1> Crypto exchange platform</h1>
                            <h2>Everyone's Favorite DEX</h2>
                            <p>
                                Trade, earn, and own crypto on the all-in-one
                                multichain DEX Trade, earn, and own crypto on
                                the all-in-one multichain DEX Trade, earn, and
                                own crypto on the all-in-one multichain DEX
                                Trade, earn, and own crypto on the all-in-one
                                multichain DEX Trade, earn, and own crypto on
                                the all-in-one multichain DEX
                            </p>
                        </div>
                    </div>
                    <div className="rightSection">
                        <h1>Connect to your wallet</h1>
                        <a href="/" onClick={initWeb3} className="btn btn-5">
                            Connect Wallet
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
