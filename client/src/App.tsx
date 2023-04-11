import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { BigNumber, ethers } from "ethers"
import { useEffect, useState } from "react"
import useSound from "use-sound"
import { useAccount, useWaitForTransaction } from "wagmi"
import "./App.css"
import { Footer } from "./components/Footer"
import { LandingCopy } from "./components/LandingCopy"
import { LinksTab } from "./components/LinksTab"
import NoticeModal from "./components/NoticeModal"
import Modal from "react-modal"
import deployments from "./deployments.json"
import {
  usePlanetsIsOpen,
  usePlanetsMint,
  usePlanetsPrice,
  usePlanetsSupply,
  usePlanetsTotalMinted,
  usePreparePlanetsMint,
} from "./generated"
import blockSpinner from "./img/blockSpinner.svg"
import generalClickEffect from "./sounds/generalClick.mp3"
import mintEffect from "./sounds/mint.mp3"
import smallClickEffect from "./sounds/smallClick.mp3"
import submitEffect from "./sounds/submit.mp3"
import { getEtherscanBaseURL } from "./utils/getEtherscanBaseURL"
import { getOpenSeaLink } from "./utils/getOpenSeaLink"
import loadingSpinner from "./img/loadingSpinner.svg"

const etherscanBaseURL = getEtherscanBaseURL(deployments.chainId)
const htmlFileURL = process.env.PUBLIC_URL + "/homeScreen.html"

function App() {
  const { data: mintPrice, isLoading: priceLoading } = usePlanetsPrice({ watch: true })
  const { data: isOpen, isLoading: isIsOpenLoading } = usePlanetsIsOpen({ watch: true })
  const { data: amountMinted, isLoading: amountMintedLoading } = usePlanetsTotalMinted({ watch: true })
  const { data: totalSupply, isLoading: totalSupplyLoading } = usePlanetsSupply()

  const addRecentTransaction = useAddRecentTransaction()
  const account = useAccount()

  const [mintCount, setMintAmount] = useState<number>(1)
  const [totalPrice, setTotalPrice] = useState<BigNumber>()
  const [mintBtnDisabled, setMintBtnDisabled] = useState<boolean>(true)
  const [mintBtnLoading, setMintBtnLoading] = useState<boolean>(false)
  const [isCustomVisible, setIsCustomVisible] = useState<boolean>(false)
  const [mintedTokens, setMintedTokens] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [soldOut, setSoldOut] = useState<boolean>(false)
  const [mintAmountTooHigh, setMintAmountTooHigh] = useState<boolean>(false)

  const [playbackRate, setPlaybackRate] = useState(0.5)
  const [smallClickSound] = useSound(smallClickEffect, { playbackRate: playbackRate })
  const [generalClickSound] = useSound(generalClickEffect)
  const [mintSound] = useSound(mintEffect)
  const [submitSound] = useSound(submitEffect)

  const { config: mintConfig, error: mintError } = usePreparePlanetsMint({
    args: [BigNumber.from(`${mintCount}`)],
    overrides: {
      value: mintPrice?.mul(mintCount!),
    },
    enabled: isOpen !== undefined && isOpen,
  })

  const {
    write: mint,
    data: mintSignResult,
    isLoading: isMintSignLoading,
    isSuccess: isMintSignSuccess,
  } = usePlanetsMint(mintConfig)

  const { data: mintTx, isLoading: isMintTxLoading } = useWaitForTransaction({
    hash: mintSignResult?.hash,
    confirmations: 1,
  })

  const handleAmountClick = (value: number) => {
    let tempPlaybackRate = playbackRate

    if (value > mintCount) {
      for (let i = mintCount; i < value; i++) {
        if (tempPlaybackRate < 10) {
          tempPlaybackRate = tempPlaybackRate + 0.4
        }
      }
      setPlaybackRate(tempPlaybackRate)
      smallClickSound()
    }
    let tempMintCount = value
    if (value < mintCount) {
      for (let i = value; i < mintCount; i++) {
        tempMintCount = tempMintCount - 1
        if (tempMintCount < 24) {
          if (tempPlaybackRate - 0.4 > 0.5) {
            tempPlaybackRate = tempPlaybackRate - 0.4
          }
        }
      }
      setPlaybackRate(tempPlaybackRate)
      smallClickSound()
    }
  }

  useEffect(() => {
    setTotalPrice(mintPrice?.mul(mintCount))
  }, [mintPrice])

  useEffect(() => {
    const loading = priceLoading || isIsOpenLoading || amountMintedLoading || isMintTxLoading
    setMintBtnLoading(loading)
    setMintBtnDisabled(loading || !isOpen)
  }, [priceLoading, isIsOpenLoading, amountMintedLoading, isMintTxLoading])

  const handleMintAmountChange = (amount: number) => {
    if (amountMinted !== undefined && totalSupply) {
      let max = totalSupply.sub(amountMinted).toNumber()
      if (amount > max) {
        amount = max
      }
    }
    setMintAmount(amount)
    setTotalPrice(mintPrice?.mul(amount))
  }

  const toggleCustomAmount = () => {
    setIsCustomVisible(!isCustomVisible)
  }

  useEffect(() => {
    const loading = priceLoading || isIsOpenLoading || amountMintedLoading || totalSupplyLoading || isMintTxLoading
    setMintBtnLoading(loading)
  }, [priceLoading, isIsOpenLoading, amountMintedLoading, isMintTxLoading])

  useEffect(() => {
    if (mintSignResult) {
      addRecentTransaction({
        hash: mintSignResult.hash,
        description: `Mint ${mintCount} Ether Planet${mintCount === 1 ? "" : "s"}`,
      })
      submitSound()
    }
  }, [mintSignResult])

  useEffect(() => {
    if (mintTx?.status === 1) {
      mintSound()
      const transferEventAbi = ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]
      const transferEventInterface = new ethers.utils.Interface(transferEventAbi)

      const tokenIds = mintTx.logs
        .map((log) => {
          try {
            const event = transferEventInterface.parseLog(log)
            if (event && event.name === "Transfer") {
              return event.args.tokenId.toString()
            }
          } catch (e) {
            return null
          }
        })
        .filter((id) => id !== null)
      setMintedTokens(tokenIds)
    }
  }, [mintTx])

  useEffect(() => {
    if (amountMinted && totalSupply) {
      setSoldOut(totalSupply.lte(amountMinted))
      setMintAmountTooHigh(amountMinted.add(mintCount + 1).gt(totalSupply))
    }
  }, [totalSupply, amountMinted, mintCount])

  const displayMintedTokens = (tokens: number[]) => {
    return (
      <>
        <span key={tokens[0]}>
          <a
            href={getOpenSeaLink(deployments.contracts.Planets.address, tokens[0])}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-800 hover:underline no-underline transition-colors"
          >
            {tokens[0]}
          </a>
          &nbsp;
        </span>
        {tokens.length > 1 && (
          <>
            {" "}
            ... &nbsp;
            <span key={tokens[tokens.length - 1]}>
              <a
                href={getOpenSeaLink(deployments.contracts.Planets.address, tokens[tokens.length - 1])}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:underline no-underline transition-colors"
              >
                {tokens[tokens.length - 1]}
              </a>
              &nbsp;
            </span>
          </>
        )}
      </>
    )
  }

  Modal.setAppElement("#root")

  return (
    <div className="App">
      <NoticeModal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false)
        }}
        onMint={() => {
          generalClickSound()
          console.log("test mint")
          setIsModalOpen(false)
          mint?.()
        }}
      />
      <LinksTab />
      <LandingCopy htmlFileURL={htmlFileURL} />
      <div className="absolute w-full  top-0 flex justify-end z-20 p-3 sm:p-5">
        <ConnectButton />
      </div>
      {/* <LinksTab /> */}
      <div className="absolute sm:top-[66%] top-[66%] w-full">
        <div className=" w-full  flex justify-center">
          <div>
            {amountMinted != undefined && totalSupply != undefined && (
              <div className="text-center text-[12px] pb-5 text-white">
                {amountMinted.toBigInt().toLocaleString()}/{totalSupply.toBigInt().toLocaleString()}
              </div>
            )}

            <div className="flex justify-center">
              <button
                className={`text-gray-500 text-[36px] mt-[-5px] hover:text-white pl-3 disabled:hover:text-gray-500 ${
                  soldOut && "hidden"
                }`}
                onClick={() => {
                  handleMintAmountChange(Math.max(1, mintCount - 1))
                  setIsCustomVisible(false)
                  handleAmountClick(mintCount - 1)
                }}
                disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading || soldOut}
              >
                -
              </button>
              <button
                onClick={() => {
                  generalClickSound()
                  setIsModalOpen(true)
                  setIsCustomVisible(false)
                }}
                className={`transition-colors duration-300 bg-none  border-[1px] min-w-[160px] ${
                  !mintBtnDisabled && !isMintSignLoading && !isMintTxLoading && !soldOut && "hover:bg-white"
                } border-white text-white hover:text-black  px-4 py-2 rounded text-[14px] mx-2 disabled:bg-none disabled:text-white disabled:border-gray-500`}
                disabled={mintBtnDisabled || isMintSignLoading || isMintTxLoading || soldOut}
              >
                {mintBtnLoading ? (
                  <div className="w-full flex justify-center h-full">
                    <img className="animate-spin w-4" src={loadingSpinner}></img>
                  </div>
                ) : (
                  <>
                    {isMintSignLoading
                      ? "Waiting for wallet..."
                      : !account.isConnected
                      ? "Connect wallet"
                      : !isOpen
                      ? "Sale not started"
                      : soldOut
                      ? "Sold Out"
                      : totalPrice !== undefined
                      ? `Mint ${mintCount} for ${ethers.utils.formatEther(totalPrice)} ETH`
                      : "Price unavailable"}
                  </>
                )}
              </button>
              <button
                disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading || soldOut || mintAmountTooHigh}
                className={`text-gray-500 text-3xl pr-3 hover:text-white disabled:hover:text-gray-500 ${
                  soldOut && "hidden"
                } `}
                onClick={() => {
                  handleMintAmountChange(mintCount + 1)
                  setIsCustomVisible(false)
                  // handleAmountClickUp()
                  handleAmountClick(mintCount + 1)
                }}
              >
                +
              </button>
            </div>
            {account.isConnected && !soldOut && (
              <>
                <div className="w-full justify-center flex mt-1 transition-all">
                  <button
                    disabled={isMintSignLoading || isMintTxLoading}
                    className=" text-[12px] text-gray-500 hover:text-white transition-all text-right"
                    onClick={() => {
                      toggleCustomAmount()
                      generalClickSound()
                    }}
                  >
                    {isCustomVisible ? <>Hide</> : <>Custom amount</>}
                  </button>
                </div>
                <div className="w-full justify-center flex mt-1 transition-all">
                  <input
                    className={`text-white block rounded text-[12px] appearance-none bg-black border border-gray-500 hover:border-blue-950 focus:border-blue-900 px-3 py-1 leading-tight focus:outline-none w-[70px] mb-2 transition-all ${
                      isCustomVisible && !isMintSignLoading && !isMintTxLoading ? "visible" : "hidden"
                    }`}
                    type="number"
                    min="1"
                    placeholder={mintCount.toString()}
                    onChange={(e) => {
                      let value = parseInt(e.target.value)
                      if (e.target.value === "" || value === 0) {
                        handleMintAmountChange(1)
                      } else {
                        handleMintAmountChange(value)
                        handleAmountClick(value)
                      }
                    }}
                  ></input>
                </div>
              </>
            )}
          </div>
        </div>
        {mintTx && mintTx.status && (
          <div className=" text-sm">
            <div className="w-full flex justify-center">
              <a
                href={`${etherscanBaseURL}/tx/${mintTx.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className=" hover:underline no-underline transition-colors pt-5 text-blue-800 "
              >
                View transaction
              </a>
            </div>
            <p className=" text-gray-500 transition-colors w-full text-center pt-1">
              Minted tokens: [ {displayMintedTokens(mintedTokens)}]
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default App
