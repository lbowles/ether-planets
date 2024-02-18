"use client"

import { useEffect } from "react"

const Redirect = () => {
  useEffect(() => {
    window.location.href = "https://etherplanets.com"
  }, [])

  return null
}

export default Redirect
