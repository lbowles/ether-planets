import React from "react"
import logo from "./logo.svg"
import { useEffect, useState } from "react"
import "./App.css"
import { BigNumber, ethers } from "ethers"
import "@rainbow-me/rainbowkit/styles.css"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { useAccount, useWaitForTransaction } from "wagmi"
import deployments from "./deployments.json"
import useSound from "use-sound"
import { getOpenSeaLink } from "./utils/getOpenSeaLink"
import NoticeModal from "./components/NoticeModal"
import submitEffect from "./sounds/submit.mp3"
import smallClickEffect from "./sounds/smallClick.mp3"
import generalClickEffect from "./sounds/generalClick.mp3"
import mintEffect from "./sounds/mint.mp3"
import blockSpinner from "./img/blockSpinner.svg"
import { Footer } from "./components/Footer"
import { LandingCopy } from "./components/LandingCopy"
import { LinksTab } from "./components/LinksTab"

const htmlFileURL = process.env.PUBLIC_URL + "/homeScreen.html"

function App() {
  // const { data: mintPrice, isLoading: priceLoading } = useBlackHolesGetPrice({ watch: true })
  // const { data: mintState, isLoading: mintStateLoading } = useBlackHolesGetMintState({ watch: true })
  //const { data: amountMinted, isLoading: amountMintedLoading } = useBlackHolesTotalMinted({ watch: true })

  const addRecentTransaction = useAddRecentTransaction()
  const account = useAccount()

  const [mintCount, setMintAmount] = useState<number>(1)
  const [totalPrice, setTotalPrice] = useState<BigNumber>()
  const [mintBtnDisabled, setMintBtnDisabled] = useState<boolean>(true)
  const [mintBtnLoading, setMintBtnLoading] = useState<boolean>(false)
  const [isCustomVisible, setIsCustomVisible] = useState<boolean>(false)
  const [mintedTokens, setMintedTokens] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const [playbackRate, setPlaybackRate] = useState(0.5)
  const [smallClickSound] = useSound(smallClickEffect, { playbackRate: playbackRate })
  const [generalClickSound] = useSound(generalClickEffect)
  const [mintSound] = useSound(mintEffect)
  const [submitSound] = useSound(submitEffect)

  // const {
  //   write: mint,
  //   data: mintSignResult,
  //   isLoading: isMintSignLoading,
  //   isSuccess: isMintSignSuccess,
  // } = useBlackHolesMint(mintConfig)

  // const { data: mintTx, isLoading: isMintTxLoading } = useWaitForTransaction({
  //   hash: mintSignResult?.hash,
  //   confirmations: 1,
  // })

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

  const handleMintAmountChange = (amount: number) => {
    setMintAmount(amount)
    //TODO: change with mintPrince    bigNumber?.mul(amount)
    const numberAsString = "42"
    const bigNumber = BigNumber.from(numberAsString)
    setTotalPrice(bigNumber?.mul(amount))
  }

  const toggelCustomAmount = () => {
    if (isCustomVisible) {
      setIsCustomVisible(false)
    } else {
      setIsCustomVisible(true)
    }
  }

  // useEffect(() => {
  //   const loading = priceLoading || mintStateLoading || amountMintedLoading || isMintTxLoading
  //   setMintBtnLoading(loading)
  // }, [priceLoading, mintStateLoading, amountMintedLoading, isMintTxLoading])

  // useEffect(() => {
  //   if (mintSignResult) {
  //     addRecentTransaction({
  //       hash: mintSignResult.hash,
  //       description: `Mint ${mintCount} Black Hole${mintCount === 1 ? "" : "s"}`,
  //     })
  //     submitSound()
  //   }
  // }, [mintSignResult])

  // TODO: useEffect(() => {
  //   if (mintTx?.status === 1) {
  //     //TODO: mintSound()
  //     const tokenIds = mintTx.logs
  //       .map((log) => {
  //         try {
  //           const events = BlackHoles__factory.createInterface().decodeEventLog("Transfer", log.data, log.topics)
  //           return events.tokenId.toString()
  //         } catch (e) {
  //           return null
  //         }
  //       })
  //       .filter((id) => id !== null)
  //     setMintedTokens(tokenIds)
  //   }
  // }, [mintTx])

  const displayMintedTokens = (tokens: number[]) => {
    return (
      <>
        <span key={tokens[0]}>
          <a
            href={getOpenSeaLink(deployments.contracts.BlackHoles.address, tokens[0])}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:underline no-underline transition-colors"
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
                href={getOpenSeaLink(deployments.chainId, tokens[tokens.length - 1])}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline no-underline transition-colors"
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

  return (
    <div className="App">
      <NoticeModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        // onMint={handleMint}
        onMint={() => {
          console.log("test mint")
        }}
      />
      <LandingCopy htmlFileURL={htmlFileURL} />
      <div className="absolute w-full  top-0 flex justify-end z-20 p-5">
        <ConnectButton />
      </div>
      {/* <LinksTab /> */}
      <div className="absolute sm:top-[66%] top-[66%] w-full  flex justify-center">
        <div>
          <div className="text-center text-[12px] pb-5 text-white">3/4242</div>
          <div className="flex justify-center">
            <button
              className="text-gray-500 text-[36px] mt-[-5px] hover:text-white"
              onClick={() => {
                handleMintAmountChange(Math.max(1, mintCount - 1))
                setIsCustomVisible(false)
                handleAmountClick(mintCount - 1)
              }}
              // TODO: disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading}
            >
              -
            </button>
            <button
              onClick={() => {
                generalClickSound()
                setIsModalOpen(true)
              }}
              className="transition-colors duration-300 bg-none hover:bg-white border-[1px] border-white text-white hover:text-black px-4 py-2 rounded text-[14px] mx-2"
              //TODO: disabled={disabled || loading}
            >
              {mintBtnLoading ? (
                <div className="w-full flex justify-center h-full">
                  <img className="h-full p-[12px]" src={blockSpinner}></img>
                </div>
              ) : (
                // TODO:  {isMintSignLoading
                //     ? "WAITING FOR WALLET"
                //     : !account.isConnected
                //     ? "CONNECT WALLET"
                //     : totalPrice !== undefined
                //     ? `MINT ${mintCount} FOR ${ethers.utils.formatEther(totalPrice)} ETH`
                //     : "PRICE UNAVAILABLE"
                // }
                <>Mint {mintCount} for 23 ETH </>
              )}
            </button>
            <button
              //TODO: disabled={mintBtnDisabled || !account.isConnected || isMintSignLoading}
              className="text-gray-500 text-3xl hover:text-white "
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
          {/* TODO change to account.isConnected */}
          {true && (
            <>
              <div className="w-full justify-center flex mt-1 transition-all">
                <button
                  // TODO: disabled={isMintSignLoading || isMintTxLoading}
                  className=" text-[12px] text-gray-500 hover:text-white transition-all text-right"
                  onClick={() => {
                    toggelCustomAmount()
                    generalClickSound()
                  }}
                >
                  {isCustomVisible ? <>Hide</> : <>Custom amount</>}
                </button>
              </div>
              <div className="w-full justify-center flex mt-1 transition-all">
                <input
                  // TODO: isCustomVisible && !isMintSignLoading && !isMintTxLoading ? "visible" : "hidden"
                  className={`text-white block rounded text-[12px] appearance-none bg-black border border-gray-500 hover:border-blue-950 focus:border-blue-900 px-3 py-1 leading-tight focus:outline-none w-[70px] mb-2 transition-all ${
                    isCustomVisible ? "visible" : "hidden"
                  }`}
                  type="number"
                  min="1"
                  max="4000"
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
        {/* TODO {mintTx && mintTx.status && (
          <div>
            <div className="w-full flex justify-center">
              <a
                //TODO: href={`${etherscanBaseURL}/tx/${mintTx.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-gray-500 hover:text-white hover:underline no-underline transition-colors pt-5"
              >
                View transaction
              </a>
            </div>
            <p className="text-base text-gray-500 transition-colors w-full text-center pt-1">
              Minted tokens: [ {displayMintedTokens(mintedTokens)}]
            </p>
          </div>
        )} */}
      </div>
      <Footer />
    </div>
  )
}

export default App
