import { createPublicClient, http } from "viem"
import deployments from "../../../client/src/deployments.json"
import { mainnet } from "viem/chains"
import { getPlanetsSvg } from "../../utils/util"

export default async function PlanetPage({ params: { tokenId } }: { params: { tokenId: string } }) {
  const { thumbnailSvg, animationHtml } = await getPlanetsSvg(tokenId, { animation: true })

  console.log({ animationHtml: decodeURIComponent(animationHtml!) })

  return (
    <div>
      <h1>Planet {tokenId}</h1>
      <div className="flex">
        <img src={`data:image/svg+xml;base64,${Buffer.from(thumbnailSvg).toString("base64")}`} alt="" />
        <iframe src={decodeURIComponent(animationHtml!)} width={500} height={500}></iframe>
      </div>
    </div>
  )
}
