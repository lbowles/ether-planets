import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const utilities = await deployments.get("utils")

  await deploy("PlanetsThumbnail", {
    from: deployer,
    libraries: {
      utils: utilities.address,
    },
    log: true,
  })
}
export default func
func.tags = ["Thumbnail"]
func.dependencies = ["Libraries"]
