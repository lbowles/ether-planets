import opensea from "../img/icons/opensea.svg"
import twitter from "../img/icons/twitter.svg"
import gihub from "../img/icons/github.svg"
import etherscan from "../img/icons/etherscan.svg"
import useSound from "use-sound"
import linkClickEffect from "../sounds/linkClick.mp3"
import deployments from "../deployments.json"
import fox from "../img/icons/fox.webp"

export const LinksTab = () => {
  const [linkClickSound] = useSound(linkClickEffect)
  return (
    <div className="bg-black z-10 absolute  border-r border-y rounded-r border-gray-800 p-[10px]  grid grid-flow-row top-[50%] transform -translate-y-1/2 gap-3">
      <a
        target="_blank"
        href="https://opensea.io/collection/etherplanets-onchain"
        onClick={() => {
          // linkClickSound()
        }}
      >
        <img src={opensea}></img>
      </a>
      <a
        target="_blank"
        href="https://twitter.com/0xEtherPlanets"
        onClick={() => {
          // linkClickSound()
        }}
      >
        <img src={twitter}></img>
      </a>
      <a
        target="_blank"
        href="https://github.com/lbowles/ether-planets"
        onClick={() => {
          // linkClickSound()
        }}
      >
        <img src={gihub}></img>
      </a>
      <a
        target="_blank"
        href={`https://etherscan.io/address/${deployments.contracts.Planets.address}`}
        onClick={() => {
          // linkClickSound()
        }}
      >
        <img src={etherscan}></img>
      </a>
      <a
        target="_blank"
        href={`https://onchainchecker.xyz/collection/ethereum/0xdabb3cc7c35147e985bab67799219b363830cf5a/37`}
        onClick={() => {
          // linkClickSound()
        }}
        className=" border border-white rounded-full bg-white"
      >
        <img src={fox} width={23}></img>
      </a>
    </div>
  )
}
