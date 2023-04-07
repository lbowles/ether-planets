require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.1",
  paths: {
    sources: "./contracts",
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
  },
};