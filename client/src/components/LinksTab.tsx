import opensea from "../img/icons/opensea.svg"
import twitter from "../img/icons/twitter.svg"
import gihub from "../img/icons/github.svg"
import etherscan from "../img/icons/etherscan.svg"
import useSound from "use-sound"
import linkClickEffect from "../sounds/linkClick.mp3"
import deployments from "../deployments.json"

export const LinksTab = () => {
  const [linkClickSound] = useSound(linkClickEffect)
  return (
    <div className="bg-black z-10 absolute  border-r border-y rounded-r border-gray-800 p-[10px]  grid grid-flow-row top-[50%] transform -translate-y-1/2 gap-3">
      <a
        target="_blank"
        href="#"
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={opensea}></img>
      </a>
      <a
        target="_blank"
        href="https://twitter.com/0xEtherPlanets"
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={twitter}></img>
      </a>
      <a
        target="_blank"
        href="https://github.com/lbowles/ether-planets"
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={gihub}></img>
      </a>
      <a
        target="_blank"
        href={`https://etherscan.io/address/${deployments.contracts.Planets.address}`}
        onClick={() => {
          linkClickSound()
        }}
      >
        <img src={etherscan}></img>
      </a>
    </div>
  )
}
