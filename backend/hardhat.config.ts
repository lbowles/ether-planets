import { HardhatUserConfig } from "hardhat/config"
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import "@nomicfoundation/hardhat-chai-matchers"

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-goerli.g.alchemy.com/v2/BfwgJcoByYOQsFKVyzZp0Z2R5m-wZ3mN",
      },
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/BfwgJcoByYOQsFKVyzZp0Z2R5m-wZ3mN",
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    // https://github.com/intartnft/scripty.sol/blob/main/deployment.json
    scriptyBuilder: {
      default: 1,
      31337: "0xc9AB9815d4D5461F3b53Ebd857b6582E82A45C49",
      5: "0xc9AB9815d4D5461F3b53Ebd857b6582E82A45C49",
      1: "0x16b727a2Fc9322C724F4Bc562910c99a5edA5084",
    },
    scriptyStorage: {
      default: 2,
      31337: "0x730B0ADaaD15B0551928bAE7011F2C1F2A9CA20C",
      5: "0x730B0ADaaD15B0551928bAE7011F2C1F2A9CA20C",
      1: "0x096451F43800f207FC32B4FF86F286EdaF736eE3",
    },
    ethfsFileStorage: {
      default: 3,
      31337: "0x70a78d91A434C1073D47b2deBe31C184aA8CA9Fa",
      5: "0x70a78d91A434C1073D47b2deBe31C184aA8CA9Fa",
      1: "0xFc7453dA7bF4d0c739C1c53da57b3636dAb0e11e",
    },
  },
}

export default config
