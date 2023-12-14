// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    // Deploy Mock Tokens (excluding MockETH)
    const MockBTC = await hre.ethers.getContractFactory("MockBTC");
    const mockBTC = await MockBTC.deploy();
    await mockBTC.deployed();
    console.log("MockBTC deployed to:", mockBTC.address);

    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();
    console.log("MockUSDT deployed to:", mockUSDT.address);

    // Deploy the Exchange Contract (without MockETH)
    const Exchange = await hre.ethers.getContractFactory("MockExchange");
    const exchange = await Exchange.deploy(mockBTC.address, mockUSDT.address);
    await exchange.deployed();
    console.log("Exchange deployed to:", exchange.address);

    // Mint tokens to Exchange
    const oneMillion = hre.ethers.utils.parseUnits("1000000", "ether"); // Assuming 18 decimals

    await mockBTC.mintToExchange(exchange.address, oneMillion);
    await mockUSDT.mintToExchange(exchange.address, oneMillion);

    // Send native ETH to the Exchange contract for liquidity
    const [deployer] = await hre.ethers.getSigners();
    const liquidityAmount = hre.ethers.utils.parseEther("1000"); // Example: 10 ETH

    const tx = {
        to: exchange.address,
        value: liquidityAmount
    };

    const receipt = await deployer.sendTransaction(tx);
    await receipt.wait();

    console.log(`Sent ${hre.ethers.utils.formatEther(liquidityAmount)} ETH to the MockExchange contract`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
