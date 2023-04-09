import React from "react"
import logo from "./logo.svg"
import "./App.css"

const htmlFileURL = process.env.PUBLIC_URL + "/homeScreen.html"

function App() {
  return (
    <div className="App">
      <div className="front-content">
        <div className="text-white flex justify-center text-3xl pt-[15vh] sm:pt-[23vh]">ΞPLANETS</div>
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
      <div className="absolute bottom-[25%]  w-full  flex justify-center">
        <button className="transition-colors duration-300 bg-none hover:bg-white border-[1px] border-white text-white hover:text-black px-4 py-2 rounded">
          Mint Ξ0.0042
        </button>
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
