import fs from "fs"
import { ethers } from "hardhat"
import path from "path"
import { ScriptyStorage } from "../types/ScriptyStorage"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ScriptyStorage__factory } from "../types"
import { PopulatedTransaction } from "ethers"
import { gzipSync } from "fflate"
import minify from "@node-minify/core"
import babelMinify from "@node-minify/babel-minify"

function chunkSubstr(str: string, size: number) {
  return str.split(new RegExp("(.{" + size.toString() + "})")).filter((O) => O)
}

function stringToBytes(str: string) {
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(str))
}

async function generateStoreScriptTxs(storageContract: ScriptyStorage, name: string, filePath: string) {
  // Check if script is already stored
  const storedScript = await storageContract.scripts(name)
  if (storedScript.size.gt(0)) {
    console.log(`${name} is already stored`)
    return
  }

  // Grab file and break into chunks that SSTORE2 can handle
  // const minified = await minify(path.join(__dirname, filePath))
  const content = fs.readFileSync(path.join(__dirname, filePath), "utf8")
  const minified = (await minify({ compressor: babelMinify, content: content })) as string
  const buffer = Buffer.from(minified)
  const compressed = gzipSync(new Uint8Array(buffer))
  const b64encoded = Buffer.from(compressed).toString("base64")
  console.log(b64encoded)
  const scriptChunks = chunkSubstr(b64encoded, 24575)

  const txs: PopulatedTransaction[] = []

  // First create the script in the storage contract
  const createTx = await storageContract.populateTransaction.createScript(name, stringToBytes(name))
  txs.push(createTx)

  // Store each chunk
  // [WARNING]: With big files this can be very costly
  for (let i = 0; i < scriptChunks.length; i++) {
    const tx = await storageContract.populateTransaction.addChunkToScript(name, stringToBytes(scriptChunks[i]))
    console.log(`Estimated gas: ${scriptChunks[i].length * 219 + 65933}`)
    txs.push(tx)
    console.log(`${name} chunk #`, i, "/", scriptChunks.length - 1, "chunk length: ", scriptChunks[i].length)
  }
  console.log(`${name} will be stored in ${txs.length} transactions`)

  return txs
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy, rawTx, execute } = deployments

  const { deployer, scriptyStorage: scriptyStorageAddress } = await getNamedAccounts()

  const signer = await ethers.getSigner(deployer)
  const scriptyStorage = ScriptyStorage__factory.connect(scriptyStorageAddress, signer)
  const txs = await generateStoreScriptTxs(scriptyStorage, "etherplanets-v1", "../../base.js")

  if (!txs) {
    return
  }

  // Execute storage transactions
  for (const tx of txs) {
    console.log(`Gas limit: ${tx.gasLimit?.toString()}`)
    await rawTx({ ...tx, to: tx.to!, from: deployer })
  }
}
export default func
func.tags = ["p5script"]
func.dependencies = []
