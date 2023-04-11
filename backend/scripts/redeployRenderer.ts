import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import readline from "readline"
import { Planets__factory } from "../types"
import * as hre from "hardhat"
import fs from "fs"
import path from "path"

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

const func = async function () {
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

  const renderer = await deployments.get("PlanetsRenderer")

  console.log(`Updating Planets contract with renderer address: ${renderer.address}`)

  const signer = await hre.ethers.getSigner(deployer)
  const planetsDeployment = await deployments.get("Planets")
  const planets = Planets__factory.connect(planetsDeployment.address, signer)
  const tx = await planets.setRendererAddress(renderer.address)

  console.log(`Transaction hash: ${tx.hash}`)

  await tx.wait()

  console.log("Done!")
}
func()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
