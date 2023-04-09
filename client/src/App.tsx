import React from "react"
import logo from "./logo.svg"
import "./App.css"

const htmlFileURL = process.env.PUBLIC_URL + "/landing.html"

function App() {
  return (
    <div className="App">
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
