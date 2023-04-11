import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"
import path from "path"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer, scriptyBuilder, ethfsFileStorage, scriptyStorage } = await getNamedAccounts()

  // Read filename
  const filename = fs.readFileSync(path.join(__dirname, ".filename")).toString()
  console.log("filename:", filename)

  await deploy("PlanetsRenderer", {
    from: deployer,
    args: [ethfsFileStorage, scriptyBuilder, scriptyStorage, filename],
    log: true,
  })
}
export default func
func.tags = ["Renderer"]
func.dependencies = ["p5script"]
