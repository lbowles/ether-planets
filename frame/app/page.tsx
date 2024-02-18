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
import Redirect from "./Redirect"

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
    <div className="p-4 bg-black h-screen flex justify-center ">
      <p className="text-white"> Redirecting to </p>
      <a className="text-blue-400 pl-1" href="https://etherplanets.com">
        etherplanets.com
      </a>
      <Redirect />
      {/* <Link href={`/debug?url=${baseUrl}`} className="underline">
        Debug
      </Link> */}
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
