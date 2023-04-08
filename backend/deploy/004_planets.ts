import * as fs from "fs"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import readline from "readline"

function userInput(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans)
    }),
  )
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  const signers = await ethers.getSigners()

  let name = "Planets"
  let symbol = "ET"

  const currentBlock = await ethers.provider.getBlockNumber()

  if (hre.network.name !== "mainnet") {
    name = "Test"
    symbol = "TEST"
  }

  console.log(`Current block: ${currentBlock}`)

  // Prompt user to confirm if network, name, symbol are correct each on its own line
  console.log(`\nDeploying to ${hre.network.name}`)
  console.log(`Name: ${name}`)
  console.log(`Symbol: ${symbol}`)

  const fee = await ethers.provider.getFeeData()

  console.log(ethers.utils.formatUnits(fee.gasPrice!, "gwei"), "gwei")
  const deployerBalance = await ethers.provider.getBalance(deployer)
  console.log(ethers.utils.formatEther(deployerBalance), "ETH")
  if (hre.network.name !== "hardhat") {
    const confirm = await userInput("Continue? (y/n)\n> ")
    if (confirm !== "y") {
      console.log("Aborting deployment")
      return
    }
  }

  const utilities = await deployments.get("utils")
  const thumbnail = await deployments.get("Thumbnail")
  const scriptyBuilder = await deployments.get("ScriptyBuilder")
  const ethfsFileStorage = await deployments.get("ContentStore")

  // string memory name,
  // string memory symbol,
  // uint256 supply,
  // uint256 price,
  // address ethfsFileStorageAddress,
  // address scriptyBuilderAddress,
  // address thumbnailAddress

  await deploy("Planets", {
    from: deployer,
    log: true,
    libraries: {
      utils: utilities.address,
    },
    args: [
      name,
      symbol,
      4242,
      ethers.utils.parseEther("0.0042"),
      ethfsFileStorage.address,
      scriptyBuilder.address,
      thumbnail.address,
    ],
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    // gasPrice: ethers.utils.parseUnits("37", "gwei"),
  })
}
export default func
func.tags = ["Planets"]
func.dependencies = ["Thumbnail", "Renderer", "Libraries"]
