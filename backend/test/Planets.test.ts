import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber } from "ethers"
import { XMLParser } from "fast-xml-parser"
import { deployments, ethers } from "hardhat"
import { Planets, Planets__factory } from "../types"

describe("Planets", function () {
  let signers: SignerWithAddress[]
  let etherPlanets: Planets
  let mintPrice: BigNumber

  beforeEach(async function () {
    await ethers.provider.send("evm_setAutomine", [true])
    await deployments.fixture(["Planets"])
    signers = await ethers.getSigners()
    const EtherPlanets = await deployments.get("Planets")
    etherPlanets = Planets__factory.connect(EtherPlanets.address, signers[0]) as Planets
    mintPrice = await etherPlanets.price()
    await etherPlanets.setMintStatus(true)
  })

  it("Should have the correct price set in the constructor", async function () {
    expect(await etherPlanets.price()).to.equal(ethers.utils.parseEther("0.0042"))
  })

  it("Should mint a new NFT and assign it to the caller", async function () {
    const initialSupply = await etherPlanets.totalSupply()
    await etherPlanets.connect(signers[0]).mint(1, { value: mintPrice })
    const finalSupply = await etherPlanets.totalSupply()
    expect(finalSupply).to.equal(initialSupply.add(1))
    expect(await etherPlanets.ownerOf(finalSupply)).to.equal(signers[0].address)
  })

  it("Should increase the total supply", async function () {
    let initialSupply = await etherPlanets.totalSupply()
    await etherPlanets.connect(signers[1]).mint(10, { value: mintPrice.mul(10) })

    expect(await etherPlanets.totalSupply()).to.equal(initialSupply.add(10))

    initialSupply = await etherPlanets.totalSupply()
  })

  it("Should return the correct token URI for a given token ID", async function () {
    // Mint a new token
    await etherPlanets.mint(1, { value: mintPrice })

    const tokenId = 1
    const name = "EtherPlanet #" + tokenId
    const description = "Fully on-chain, procedurally generated, 3D planets."
    const metadata = await etherPlanets.tokenURI(tokenId)

    // console.log(metadata)
    // Decode base64 encoded json
    const json = JSON.parse(metadata.split("data:application/json,", 2)[1])

    // console.log(json.attributes)

    expect(json.name).to.equal(name)
    expect(json.description).to.equal(description)
    expect(json.image).to.contain("data:image/svg+xml;base64")

    // console.log(json.image)

    expect(json.animation_url).to.contain("data%3Atext")

    // Check SVG validity
    const svg = Buffer.from(json.image.split(",")[1], "base64").toString()
    const parser = new XMLParser()
    expect(parser.parse(svg, true)).to.not.throw
  })

  it("Should allow the owner to withdraw their balance", async function () {
    const [owner, minter] = signers
    const initialBalance = await owner.getBalance()
    await etherPlanets.connect(minter).mint(1, { value: mintPrice })
    await etherPlanets.connect(owner).withdraw()
    const finalBalance = await owner.getBalance()
    expect(finalBalance).to.be.gt(initialBalance)
  })

  it("Should not allow a non-owner to withdraw the contract's balance", async function () {
    await expect(etherPlanets.connect(signers[1]).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("Should allow the owner to airdrop to an array of recipients", async function () {
    const [owner, recipient1, recipient2] = signers
    const initialSupply = await etherPlanets.totalSupply()
    const recipients = [recipient1.address, recipient2.address]
    const quantity = 10
    await etherPlanets.connect(owner).airdrop(recipients, quantity)
    const finalSupply = await etherPlanets.totalSupply()
    expect(finalSupply).to.equal(initialSupply.add(recipients.length * quantity))

    // Check if recipient's balance has increased
    expect(await etherPlanets.balanceOf(recipient1.address)).to.equal(quantity)
    expect(await etherPlanets.balanceOf(recipient2.address)).to.equal(quantity)
  })

  it("Should not allow a non-owner to airdrop to an array of recipients", async function () {
    const recipients = [signers[1].address]
    const quantity = 10
    await expect(etherPlanets.connect(signers[1]).airdrop(recipients, quantity)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    )
  })

  it("Should set the price correctly", async function () {
    // Get current price
    const currentPrice = await etherPlanets.price()

    // Set new price
    const newPrice = currentPrice.mul(2)
    await etherPlanets.setPrice(newPrice)

    // Check if price has been updated
    expect(await etherPlanets.price()).to.equal(newPrice)

    // Try to mint with old price
    await expect(etherPlanets.mint(1, { value: currentPrice })).to.be.revertedWithCustomError(
      etherPlanets,
      "InsufficientFunds",
    )

    // Mint with new price
    await etherPlanets.mint(1, { value: newPrice })

    // Check if supply has increased
    expect(await etherPlanets.totalSupply()).to.equal(1)
  })

  it("Should refund if the amount sent is greater than the price", async function () {
    const initialBalance = await signers[0].getBalance()
    await etherPlanets.mint(1, { value: mintPrice.mul(10) })
    const finalBalance = await signers[0].getBalance()
    expect(finalBalance)
      .to.be.lt(initialBalance.sub(mintPrice))
      .and.gt(initialBalance.sub(mintPrice.mul(10)))
  })

  it("Should mint", async function () {
    // Get price
    mintPrice = await etherPlanets.price()

    // Mint
    const initialSupply = await etherPlanets.totalSupply()

    // Get new price
    mintPrice = await etherPlanets.price()

    // Mint
    expect(await etherPlanets.mint(1, { value: mintPrice }))
      .to.emit(etherPlanets, "Transfer")
      .withArgs(ethers.constants.AddressZero, signers[0].address, 1)

    // Check if supply has increased
    expect(await etherPlanets.totalSupply()).to.equal(initialSupply.add(1))

    // Check if recipient's balance has increased
    expect(await etherPlanets.balanceOf(signers[0].address)).to.equal(1)
  })

  it("Should not mint if not isOpen", async function () {
    // Close the contract
    await etherPlanets.setMintStatus(false)
    const isOpen = await etherPlanets.isOpen()

    expect(isOpen).to.equal(false)

    // Try to mint
    await expect(etherPlanets.mint(1, { value: mintPrice })).to.be.revertedWithCustomError(etherPlanets, "MintClosed")

    // Open the contract
    await etherPlanets.setMintStatus(true)

    // Check if contract is open
    expect(await etherPlanets.isOpen()).to.equal(true)

    // Mint
    expect(await etherPlanets.mint(1, { value: mintPrice })).to.emit(etherPlanets, "Transfer")
  })

  it("Should not be able to update renderer and thumbnail if finalized", async function () {
    // Finalized should be false
    expect(await etherPlanets.finalized()).to.equal(false)

    await etherPlanets.setRendererAddress(signers[1].address)

    // Check if renderer has been updated
    expect(await etherPlanets.rendererAddress()).to.equal(signers[1].address)

    await etherPlanets.setThumbnailAddress(signers[1].address)

    // Check if thumbnail has been updated
    expect(await etherPlanets.thumbnailAddress()).to.equal(signers[1].address)

    // Finalize
    await etherPlanets.finalize()

    // Try to update renderer
    await expect(etherPlanets.setRendererAddress(signers[1].address)).to.be.revertedWithCustomError(
      etherPlanets,
      "Finalized",
    )

    // Try to update thumbnail
    await expect(etherPlanets.setThumbnailAddress(signers[1].address)).to.be.revertedWithCustomError(
      etherPlanets,
      "Finalized",
    )
  })

  it("Should not allow minting more than total supply", async function () {
    // Get current supply
    const totalSupply = await etherPlanets.supply()

    // Mint the max supply
    await etherPlanets.mint(totalSupply, { value: mintPrice.mul(totalSupply) })

    // Check if supply has increased
    expect(await etherPlanets.totalSupply()).to.equal(totalSupply)

    // Try to mint more
    await expect(etherPlanets.mint(1)).to.be.revertedWithCustomError(etherPlanets, "SoldOut")
  })
})
