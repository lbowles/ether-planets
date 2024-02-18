import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server"
import Link from "next/link"
import sharp from "sharp"
import { convertToSvg1, getPlanetsSvg } from "../utils/util"

type State = {
  seed: number
}

function randomTokenId() {
  return Math.floor(Math.random() * 1000)
  // return 608
}

const initialState = { seed: 608 }

const reducer: FrameReducer<State> = (state, action) => {
  return {
    seed: randomTokenId(),
  }
}
// This is a react server component only
export default async function Home({ params, searchParams }: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams)

  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame)

  const { thumbnailSvg } = await getPlanetsSvg(state.seed)

  const containerSvg = `
    ${convertToSvg1(thumbnailSvg)}
  `

  console.log("info: state is:", state)

  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000"

  const pngBuffer = await sharp(Buffer.from(containerSvg)).resize(500, 500).png().toBuffer()

  return (
    <div className="p-4">
      frames.js starter kit. The Template Frame is on this page, it&apos;s in the html meta tags (inspect source).{" "}
      <Link href={`/debug?url=${baseUrl}`} className="underline">
        Debug
      </Link>
      <FrameContainer postUrl="/frames" pathname="/" state={state} previousFrame={previousFrame}>
        {/* <FrameImage src="https://framesjs.org/og.png" /> */}
        <FrameImage aspectRatio="1:1" src={`data:image/png;base64,${pngBuffer.toString("base64")}`}></FrameImage>
        <FrameButton>Next Planet →</FrameButton>
        <FrameButton action="link" target={`${process.env.NEXT_PUBLIC_HOST!}/${state.seed}`}>
          View 3D
        </FrameButton>
        <FrameButton action="link" target={process.env.NEXT_PUBLIC_HOST!}>
          Mint
        </FrameButton>
      </FrameContainer>
    </div>
  )
}
