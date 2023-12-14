require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // You can define other networks here
  },
  paths: {
    artifacts: "./src/artifacts",
  }
};
