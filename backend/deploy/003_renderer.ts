import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer, scriptyBuilder, ethfsFileStorage, scriptyStorage } = await getNamedAccounts()

  await deploy("PlanetsRenderer", {
    from: deployer,
    args: [ethfsFileStorage, scriptyBuilder, scriptyStorage],
    log: true,
  })
}
export default func
func.tags = ["Renderer"]
func.dependencies = ["p5script"]
