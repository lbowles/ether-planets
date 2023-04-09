import React from "react"
import logo from "./logo.svg"
import "./App.css"

const htmlFileURL = process.env.PUBLIC_URL + "/homeScreen.html"

function App() {
  return (
    <div className="App">
      <div className="front-content">
        <div className="text-white flex justify-center text-3xl pt-[25vh]">ΞPLANETS</div>
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
