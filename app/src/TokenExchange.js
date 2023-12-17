import React, { useState, useEffect } from "react";
import BigNumber from "bignumber.js";
import "./TokenExchange.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";

const TokenExchange = ({
    web3,
    accounts,
    contract,
    tokenAddresses,
    updateTokenBalances,
    platformTokenBalances,
    userTokenBalances,
}) => {
    const [fromToken, setFromToken] = useState("ETH");
    const [toToken, setToToken] = useState("BTC");
    const [amount, setAmount] = useState(0);
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [calculatedAmountforshow, setCalculatedAmountforshow] = useState(0);
    const [userBalanceWarning, setUserBalanceWarning] = useState("");
    const [platformBalanceWarning, setPlatformBalanceWarning] = useState("");
    const [exchangeRates, setExchangeRates] = useState({
        BTC: 40000,
        ETH: 3000,
        USDT: 1,
    });
    const [feePercentage, setFeePercentage] = useState(1 / 100);
    const [calculatedFee, setCalculatedFee] = useState(0);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
                );
                const data = await response.json();
                setExchangeRates({
                    BTC: data.bitcoin.usd,
                    ETH: data.ethereum.usd,
                    USDT: 1,
                });
            } catch (error) {
                console.error("Error fetching exchange rates:", error);
            }
        };

        fetchExchangeRates();
    }, []);

    const erc20Abi = [
        {
            constant: true,
            inputs: [
                { name: "_owner", type: "address" },
                { name: "_spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ name: "", type: "uint256" }],
            type: "function",
        },
        {
            constant: false,
            inputs: [
                { name: "_spender", type: "address" },
                { name: "_value", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            type: "function",
        },
    ];

    const checkAllowance = async (tokenSymbol, owner, spender) => {
        const tokenAddress = tokenAddresses[tokenSymbol];
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        return await tokenContract.methods.allowance(owner, spender).call();
    };

    const setAllowance = async (tokenSymbol, spender, amount) => {
        const tokenAddress = tokenAddresses[tokenSymbol];
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        await tokenContract.methods
            .approve(spender, amount)
            .send({ from: accounts[0] });
    };

    const checkBalances = (fromToken, toToken, fromAmount, toAmount) => {
        setUserBalanceWarning("");
        setPlatformBalanceWarning("");

        // Check user balance for the 'from' token
        const fromTokenBalance =
            fromToken === "ETH"
                ? userTokenBalances["ETH"]
                : userTokenBalances[fromToken];
        if (
            new BigNumber(fromTokenBalance).isLessThan(
                new BigNumber(web3.utils.toWei(fromAmount.toString(), "ether"))
            )
        ) {
            setUserBalanceWarning("Insufficient user balance for the trade.");
        }

        // Check platform balance for the 'to' token
        const toTokenBalance =
            toToken === "ETH"
                ? platformTokenBalances["ETH"]
                : platformTokenBalances[toToken];
        if (new BigNumber(toTokenBalance).isLessThan(new BigNumber(toAmount))) {
            setPlatformBalanceWarning(
                "Insufficient platform balance for the trade."
            );
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
        checkBalances(
            fromToken,
            e.target.value,
            amount,
            calculatedAmountforshow
        );
    };

    const handleAmountChange = (e) => {
        const inputAmount = e.target.value;
        if (inputAmount) {
            setAmount(inputAmount);
            updateExchangeRate(fromToken, toToken, inputAmount);

            setUserBalanceWarning("");
            setPlatformBalanceWarning("");

            checkBalances(
                fromToken,
                toToken,
                inputAmount,
                calculatedAmountforshow
            );
        }
    };

    const updateExchangeRate = (from, to, inputAmount = amount) => {
        const rate = exchangeRates[from] / exchangeRates[to] || 0;

        // Convert the input amount to a BigNumber to handle large numbers
        const inputAmountBN = new BigNumber(inputAmount);

        // Calculate the converted amount
        const calculated = inputAmountBN
            .multipliedBy(rate)
            .multipliedBy(new BigNumber(10).pow(18));

        // Calculate the fee
        const fee = calculated.multipliedBy(feePercentage).dividedBy(100);

        // Calculate the net amount after deducting the fee
        const netAmount = calculated.minus(fee);

        // Convert BigNumbers to strings for Ethereum transaction
        setCalculatedFee(fee.toFixed(0)); // No decimals for fee
        setCalculatedAmount(netAmount.toFixed(0)); // No decimals for amount

        // Convert the net amount to a human-readable format for display
        const show = netAmount.dividedBy(new BigNumber(10).pow(18)).toFixed(7); // 7 decimal places for display
        setCalculatedAmountforshow(show);
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
        setUserBalanceWarning("");
        setPlatformBalanceWarning("");

        // Update the exchange rate and check balances with swapped tokens
        updateExchangeRate(
            tempToToken,
            tempFromToken,
            tempCalculatedAmountForShow
        );
        checkBalances(
            tempToToken,
            tempFromToken,
            tempCalculatedAmountForShow,
            tempAmount
        );
    };

    const executeTrade = async () => {
        if (!contract) return;

        try {
            if (fromToken !== "ETH") {
                const fromTokenAmount = web3.utils.toWei(
                    amount.toString(),
                    "ether"
                );
                const allowance = await checkAllowance(
                    fromToken,
                    accounts[0],
                    contract.options.address
                );
                if (
                    new BigNumber(allowance).isLessThan(
                        new BigNumber(fromTokenAmount)
                    )
                ) {
                    await setAllowance(
                        fromToken,
                        contract.options.address,
                        fromTokenAmount
                    );
                }
            }

            if (fromToken === "ETH") {
                await contract.methods
                    .tradeEthForToken(toToken, calculatedAmount.toString())
                    .send({
                        from: accounts[0],
                        value: web3.utils.toWei(amount.toString(), "ether"),
                    });
            } else if (toToken === "ETH") {
                await contract.methods
                    .tradeTokenForEth(
                        fromToken,
                        web3.utils.toWei(amount.toString(), "ether"),
                        calculatedAmount.toString()
                    )
                    .send({ from: accounts[0] });
            } else {
                await contract.methods
                    .trade(
                        fromToken,
                        toToken,
                        web3.utils.toWei(amount.toString(), "ether"),
                        calculatedAmount.toString()
                    )
                    .send({ from: accounts[0] });
            }
            alert("Trade executed");
            await updateTokenBalances();
        } catch (error) {
            console.error("Trade execution error:", error);
            alert("Trade failed. See console for details.");
        }
    };

    return (
        <div className="card">
            <div className="container-1">
                <h2>Swap</h2>
                <p>Trade tokens in an instant</p>
            </div>
            <hr />
            <div className="container-2">
                <p>BTC/USDT ${exchangeRates["BTC"]}</p>
                <p>ETH/USDT ${exchangeRates["ETH"]}</p>
            </div>
            <div className="container-3"></div>
            {userBalanceWarning && (
                <p style={{ color: "red" }}>{userBalanceWarning}</p>
            )}
            <div className="selectContainer">
                <div className="space-between">
                    <label>From: </label>
                    <select value={fromToken} onChange={handleFromTokenChange}>
                        <option value="ETH">ETH</option>
                        <option value="BTC">BTC</option>
                        <option value="USDT">USDT</option>
                    </select>
                </div>

                <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                />
            </div>
            <div className="flex-center">
                <button className="flex-center" onClick={handleSwapButtonClick}>
                    <h6>Switch</h6>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        width="16"
                        viewBox="0 0 512 512"
                    >
                        <path
                            fill="#a6ff89"
                            d="M32 96l320 0V32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160L32 160c-17.7 0-32-14.3-32-32s14.3-32 32-32zM480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32H160v64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-96-96c-6-6-9.4-14.1-9.4-22.6s3.4-16.6 9.4-22.6l96-96c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 64H480z"
                        />
                    </svg>
                </button>
            </div>
            <div className="selectContainer">
                <div className="space-between">
                    <label>To: </label>
                    <select value={toToken} onChange={handleToTokenChange}>
                        <option value="ETH">ETH</option>
                        <option value="BTC">BTC</option>
                        <option value="USDT">USDT</option>
                    </select>
                </div>

                <input type="text" value={calculatedAmountforshow} readOnly />
                <p>
                    Trading Fee 0.01%:
                    <br />
                    {web3.utils.fromWei(calculatedFee.toString(), "ether")}{" "}
                    {toToken}
                </p>
                {platformBalanceWarning && (
                    <p style={{ color: "red" }}>{platformBalanceWarning}</p>
                )}
            </div>
            <div className="flex-center">
                <button onClick={executeTrade} className="btn-4">
                    swap
                </button>
            </div>
        </div>
    );
};

export default TokenExchange;
