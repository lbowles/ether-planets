async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ProceduralPlanet = await ethers.getContractFactory("ProceduralPlanetNFT");
  const proceduralPlanet = await ProceduralPlanet.deploy();
  console.log("ProceduralPlanet address:", proceduralPlanet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });