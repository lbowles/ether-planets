import babelMinify from "@node-minify/babel-minify"
import minify from "@node-minify/core"
import { PopulatedTransaction } from "ethers"
import { gzipSync } from "fflate"
import fs from "fs"
import * as hre from "hardhat"
import path from "path"
import { ScriptyStorage, ScriptyStorage__factory } from "../types"

const { ethers } = hre

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

const func = async function () {
  // Check if .filename exists, if it does, skip
  if (fs.existsSync(path.join(__dirname, ".filename"))) {
    console.log("Skipping p5script deployment")
    return
  }

  const { deployments, getNamedAccounts, ethers, artifacts } = hre
  const { deploy, rawTx, execute } = deployments

  const { deployer, scriptyStorage: scriptyStorageAddress } = await getNamedAccounts()

  const signer = await ethers.getSigner(deployer)
  const scriptyStorage = ScriptyStorage__factory.connect(scriptyStorageAddress, signer)
  const versionString = new Date().toISOString()
  const filename = `etherplanets-${versionString}` // "etherplanets-2023-04-11T10:29:40.947Z" //`etherplanets-${versionString}`
  const txs = await generateStoreScriptTxs(scriptyStorage, filename, "../../base.js")

  // Save filename to a file
  fs.writeFileSync(path.join(__dirname, ".filename"), filename)
  console.log(`Wrote filename to ${path.join(__dirname, ".filename")}`)

  if (!txs) {
    return
  }

  // Execute storage transactions
  for (const tx of txs) {
    await rawTx({ ...tx, to: tx.to!, from: deployer })
  }
}
func()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
