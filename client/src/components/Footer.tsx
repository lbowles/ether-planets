import useSound from "use-sound"
import linkClickEffect from "../sounds/linkClick.mp3"

export const Footer = () => {
  const [linkClickSound] = useSound(linkClickEffect)

  return (
    <div className="absolute bottom-[2%]  w-full  flex justify-center sm:text-sm text-[12px]  text-gray-600">
      Made by
      <a
        href="https://twitter.com/npm_luko"
        target="_blank"
        className="hover:underline text-blue-800 px-2"
        onClick={() => linkClickSound()}
      >
        @npm_luko
      </a>
      and{" "}
      <a
        href="https://twitter.com/stephancill"
        target="_blank"
        className="hover:underline text-blue-800 px-2"
        onClick={() => linkClickSound()}
      >
        @stephancill
      </a>
    </div>
  )
}
