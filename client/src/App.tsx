import React from "react"
import logo from "./logo.svg"
import "./App.css"
import P5Sketch from "./components/P5Sketch"

const htmlFileURL = process.env.PUBLIC_URL + "/landing.html"

function App() {
  return (
    <div className="App">
      <p style={{ color: "white" }}>sadas</p>
      <iframe
        title="Embedded HTML File"
        src={htmlFileURL}
        width="100%"
        height="500px"
        style={{ border: "none" }}
      ></iframe>
    </div>
  )
}

export default App
