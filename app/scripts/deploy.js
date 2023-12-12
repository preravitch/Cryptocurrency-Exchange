// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    // Deploy the Exchange Contract
    const Exchange = await hre.ethers.getContractFactory("MockExchange");
    const exchange = await Exchange.deploy(); // Add constructor arguments if any
    await exchange.deployed();
    console.log("Exchange deployed to:", exchange.address);

    // Deploy MockBTC
    const MockBTC = await hre.ethers.getContractFactory("MockBTC");
    const mockBTC = await MockBTC.deploy(exchange.address);
    await mockBTC.deployed();
    console.log("MockBTC deployed to:", mockBTC.address);

    // Deploy MockETH
    const MockETH = await hre.ethers.getContractFactory("MockETH");
    const mockETH = await MockETH.deploy(exchange.address);
    await mockETH.deployed();
    console.log("MockETH deployed to:", mockETH.address);

    // Deploy MockUSDT
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy(exchange.address);
    await mockUSDT.deployed();
    console.log("MockUSDT deployed to:", mockUSDT.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
