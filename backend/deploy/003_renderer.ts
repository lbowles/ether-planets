import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const utilities = await deployments.get("utils")

  const scriptyBuilder = await deployments.get("ScriptyBuilder")
  const ethfsFileStorage = await deployments.get("ContentStore")

  await deploy("Renderer", {
    from: deployer,
    args: [ethfsFileStorage.address, scriptyBuilder.address],
    log: true,
  })
}
export default func
func.tags = ["Renderer"]
func.dependencies = []
