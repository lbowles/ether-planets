import React from "react"
import logo from "./logo.svg"
import { useEffect, useState } from "react"
import "./App.css"
import { BigNumber, ethers } from "ethers"
import "@rainbow-me/rainbowkit/styles.css"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import deployments from "./deployments.json"
import useSound from "use-sound"

import smallClickEffect from "./sounds/smallClick.mp3"
import generalClickEffect from "./sounds/generalClick.mp3"
import blockSpinner from "./img/blockSpinner.svg"

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
  const [playbackRate, setPlaybackRate] = useState(0.75)
  const [smallClickSound] = useSound(smallClickEffect, { playbackRate: playbackRate })
  const [generalClickSound] = useSound(generalClickEffect)

  // const {
  //   write: mint,
  //   data: mintSignResult,
  //   isLoading: isMintSignLoading,
  //   isSuccess: isMintSignSuccess,
  // } = useBlackHolesMint(mintConfig)

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

  return (
    <div className="App">
      <div className="relative w-full flex justify-end z-10 p-5">
        <ConnectButton />
      </div>
      <div className="front-content">
        <div className="text-white flex justify-center text-3xl pt-[5vh] sm:pt-[17vh]">
          <div style={{ fontFamily: "arial", marginTop: "1px" }}>Ξ</div>PLANETS
        </div>
        <div className="text-gray-400 flex justify-center sm:text-lg text-[16px] pt-6 text-center px-3 ">
          Fully on-chain, procedurally generated, 3D planets.
        </div>
      </div>
      <iframe
        title="Embedded HTML File"
        src={htmlFileURL}
        className="full-screen-iframe"
        style={{ border: "none" }}
        scrolling="no"
      ></iframe>
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
      <div className="absolute bottom-[2%]  w-full  flex justify-center text-sm text-gray-600">
        Made by
        <a href="https://twitter.com/npm_luko" target="_blank" className="hover:underline text-blue-800 px-2">
          @npm_luko
        </a>
        and{" "}
        <a href="https://twitter.com/stephancill" target="_blank" className="hover:underline text-blue-800 px-2">
          @stephancill
        </a>
      </div>
    </div>
  )
}

export default App
