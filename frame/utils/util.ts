import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import deployments from "../../client/src/deployments.json"

export async function getPlanetsSvg(tokenId: string | number, options?: { animation?: boolean }) {
  // Generate NFT settings from seed
  const client = createPublicClient({
    transport: http(process.env.MAINNET_RPC_URL!),
    chain: mainnet,
  })

  const planetsContract = {
    address: deployments.contracts.Planets.address as `0x${string}`,
    abi: deployments.contracts.Planets.abi,
  }

  const thumbnailContract = {
    address: deployments.contracts.PlanetsThumbnail.address as `0x${string}`,
    abi: deployments.contracts.PlanetsThumbnail.abi,
  }

  const rendererContract = {
    address: deployments.contracts.PlanetsRenderer.address as `0x${string}`,
    abi: deployments.contracts.PlanetsRenderer.abi,
  }

  const settings = (await client.readContract({
    ...planetsContract,
    functionName: "buildSettings",
    args: [tokenId],
  })) as {
    seed: bigint
    planetSize: bigint
    hasRings: boolean
    numMoons: bigint
    planetType: number
    hue: bigint
    hasWater: boolean
  }

  const [vars, attributes, thumbnailSvgBytes] = await Promise.all([
    client.readContract({
      ...planetsContract,
      functionName: "buildVars",
      args: [settings],
    }),
    client.readContract({
      ...planetsContract,
      functionName: "buildAttributes",
      args: [settings],
    }),
    client.readContract({
      ...thumbnailContract,
      functionName: "buildThumbnail",
      args: [settings],
    }),
    async () => {
      if (options?.animation) {
        const client = createPublicClient({
          transport: http(process.env.MAINNET_RPC_URL!),
          chain: mainnet,
        })
        const animationSvgBytes = (await client.readContract({
          ...rendererContract,
          functionName: "buildAnimationURI",
          args: [vars],
        })) as `0x${string}`
        const animationBuffer = Buffer.from(animationSvgBytes.slice(2), "hex")
        // const b64animation = animationBuffer.toString("base64")
        animationHtml = animationBuffer.toString("utf-8")
      }
    },
  ])

  let animationHtml: string | null = null

  if (options?.animation) {
    const client = createPublicClient({
      transport: http(process.env.MAINNET_RPC_URL!),
      chain: mainnet,
    })
    const animationSvgBytes = (await client.readContract({
      ...rendererContract,
      functionName: "buildAnimationURI",
      args: [vars],
    })) as `0x${string}`
    const animationBuffer = Buffer.from(animationSvgBytes.slice(2), "hex")
    // const b64animation = animationBuffer.toString("base64")
    animationHtml = animationBuffer.toString("utf-8")
  }

  const thumbnailBuffer = Buffer.from((thumbnailSvgBytes as string).slice(2), "hex")
  // const b64thumbnail = thumbnailBuffer.toString("base64")
  const thumbnailSvg = thumbnailBuffer.toString("utf-8")

  return {
    animationHtml,
    thumbnailSvg,
  }
}

export function convertToSvg1(inputString: string) {
  // Regex to specifically match the transform attribute with the given starting sequence
  const regex = /(transform=")translate\(-26,-20\),translate\(200,200\),scale\((.*?)(")/

  // Replace function to only modify the matching transform attribute
  return inputString.replace(regex, function (match, p1, p2, p3) {
    // Prepend and append the translates to the specific part of the transform value
    const newTransformValue = `translate(72,60),translate(-26,-20),translate(200,200),scale(${p2}translate(-72,-60)`

    // Return the modified transform attribute
    return `${p1}${newTransformValue}${p3}`
  })
}
