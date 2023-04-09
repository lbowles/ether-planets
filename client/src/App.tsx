import React from "react"
import logo from "./logo.svg"
import "./App.css"

const htmlFileURL = process.env.PUBLIC_URL + "/homeScreen.html"

function App() {
  return (
    <div className="App">
      <div className="front-content">
        <div className="text-white flex justify-center text-3xl pt-[15vh] sm:pt-[25vh]">ΞPLANETS</div>
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
    </div>
  )
}

export default App
