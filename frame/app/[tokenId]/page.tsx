import { createPublicClient, http } from "viem"
import deployments from "../../../client/src/deployments.json"
import { mainnet } from "viem/chains"
import { getPlanetsSvg } from "../../utils/util"

export default async function PlanetPage({ params: { tokenId } }: { params: { tokenId: string } }) {
  const { thumbnailSvg, animationHtml } = await getPlanetsSvg(tokenId, { animation: true })

  console.log({ animationHtml: decodeURIComponent(animationHtml!) })

  return (
    <div className="bg-black h-screen w-screen flex justify-center items-center flex-col p-5 space-y-5">
      <h1 className="text-white text-xl "> ΞPlanet #{tokenId}</h1>
      <a href="https://etherplanets.com" target="_blank">
        <button className="p-2 border border-white hover:bg-white transition-colors hover:text-black rounded-md text-white ">
          Mint now ↗︎
        </button>
      </a>
      <div className="overflow-clip w-full grid md:grid-cols-2 grid-cols-1 max-w-4xl gap-4">
        <div className="w-full flex justify-center md:h-auto h-[250px] rounded-xl border border-gray-500  overflow-clip">
          <img src={`data:image/svg+xml;base64,${Buffer.from(thumbnailSvg).toString("base64")}`} alt="" />
        </div>
        <div className="md:h-auto h-[250px]  rounded-xl border border-gray-500  overflow-clip">
          <iframe src={decodeURIComponent(animationHtml!)} width="100%" height="100%"></iframe>
        </div>
      </div>
    </div>
  )
}
