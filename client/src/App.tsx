import React from "react"
import logo from "./logo.svg"
import { useEffect, useState } from "react"
import "./App.css"
import { ethers } from "ethers"
import "@rainbow-me/rainbowkit/styles.css"
import { publicProvider } from "wagmi/providers/public"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { darkTheme, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import * as allChains from "@wagmi/chains"
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi"
import deployments from "./deployments.json"

// Loop over all chains and check if they match deployments.chainId
const deployedChain = Object.values(allChains).filter((chain) => {
  return deployments.chainId === chain.id.toString()
})[0]

// Check if in development
const isDev = process.env.NODE_ENV === "development"

const { chains, provider, webSocketProvider } = configureChains([deployedChain], [publicProvider()])

const { connectors } = getDefaultWallets({
  appName: "BlackHoles",
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

const htmlFileURL = process.env.PUBLIC_URL + "/homeScreen.html"

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        showRecentTransactions={true}
        chains={chains}
        theme={{
          ...darkTheme({ accentColor: "#1E40AF" }),
          fonts: {
            body: "Space Mono, monospace",
          },
        }}
      >
        <div className="App">
          <div className="relative w-full flex justify-end z-10 p-5">
            <ConnectButton />
          </div>
          <div className="front-content">
            <div className="text-white flex justify-center text-3xl pt-[6vh] sm:pt-[17vh]">
              <div style={{ fontFamily: "arial", marginTop: "1px" }}>Ξ</div>PLANETS
            </div>
            <div className="text-gray-400 flex justify-center text-lg pt-6 text-center ">
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
          <div className="absolute sm:bottom-[25%] bottom-[21%] w-full  flex justify-center">
            <div>
              <div className="text-center text-[12px] pb-4 text-white">3/4242</div>
              <button className="transition-colors duration-300 bg-none hover:bg-white border-[1px] border-white text-white hover:text-black px-4 py-2 rounded text-[14px]">
                Mint 1 for 0.0042 Ξ
              </button>
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
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App
