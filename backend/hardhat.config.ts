import { HardhatUserConfig } from "hardhat/config"
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"

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
}

export default config
