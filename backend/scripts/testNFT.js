
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Get the contract factory
  const ProceduralPlanet = await ethers.getContractFactory("ProceduralPlanetNFT");

  // Fetch the deployed contract instance
  const deployedAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const planetContract = await ProceduralPlanet.attach(deployedAddress);

  // Mint a new NFT
  console.log("Minting new NFT...");
  const mintTx = await planetContract.mintPlanet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // Replace with your own account address
  await mintTx.wait();

  // Get the token URI of the newly minted NFT
  const tokenURI = await planetContract.tokenURI(0);
  console.log("Token URI:", tokenURI);

  // Print the planet attributes
  const planetAttributes = await planetContract.getPlanet
  Attributes(1);
  console.log("Planet Attributes:", planetAttributes);
  }
  
  main()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
  });