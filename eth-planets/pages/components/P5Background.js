import React, { Component } from "react"
import dynamic from "next/dynamic"
import Sketch from "react-p5"
const P5Wrapper = import("react-p5")

class PlanetGenerator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isClient: false,
    }
    this.loadedCount = 0
    this.angle = 0
    this.textureImg
    this.stars = []
    this.planetSize
    this.initialRotationX
    this.initialRotationY
    this.hasRings
    this.rings = []
    this.ringSize
    this.numRingParticles
    this.numMoons
    this.moons = []
    this.moonTextures = []
    this.planetType
    this.ringTextureImg
  }
  componentDidMount() {
    if (typeof window !== "undefined") {
      this.setState({ isClient: true, hasRendered: false })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // only re-render if state.isClient changes or if it hasn't rendered yet
    return nextState.isClient !== this.state.isClient || !this.state.hasRendered
  }

  setup = (p5, canvasParentRef) => {
    p5.randomSeed(1767)
    if (typeof window === "undefined") {
      return // do nothing if window is not defined
    }
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL).parent(canvasParentRef)
    let numColors = 5
    let randomPalette = []
    for (let i = 0; i < numColors; i++) {
      randomPalette.push(p5.color(p5.random(255), p5.random(255), p5.random(255)))
    }
    let thresholds = []
    for (let i = 0; i < numColors - 1; i++) {
      thresholds.push(p5.random())
    }
    thresholds.sort()
    let randomColorPalette = {
      thresholds: thresholds,
      colors: randomPalette,
    }

    // Generate stars
    for (let i = 0; i < 2000; i++) {
      this.stars.push({
        x: p5.random(-500 * 5, 500 * 5),
        y: p5.random(-500 * 5, 500 * 6),
        z: p5.random(500 * 8),
        radius: p5.random(0.5, 2),
      })
    }

    this.planetSize = p5.random(20, 70)
    this.initialRotationX = p5.random(360)
    this.initialRotationY = 148
    this.planetType = p5.random() < 0.5 ? "gas" : "solid"
    this.textureImg = this.generateTexture(
      p5,
      randomColorPalette.thresholds,
      randomColorPalette.colors,
      this.planetType,
    )

    // Determine if the planet should have rings
    this.hasRings = true // 50% chance
    if (this.hasRings) {
      this.ringSize = p5.random(this.planetSize * 1.5, this.planetSize * 1.7)
      let baseColor = p5.random(randomColorPalette.colors) // Select a random color from the planet's color palette
      console.log(baseColor)
      this.ringTextureImg = this.generateRingTexture(p5, baseColor) // Pass the base color to generateRingTexture()
    }

    // Generate moons
    this.numMoons = Math.floor(p5.random(1, 4)) // Up to 3 moons
    for (let i = 0; i < this.numMoons; i++) {
      let moonRadius = p5.random(this.planetSize * 0.08, this.planetSize * 0.21)

      let minMoonDistance = this.hasRings ? this.ringSize * 1.2 : this.planetSize * 1.5 // Change minimum distance based on presence of rings
      let maxMoonDistance = this.planetSize * 8
      let moonDistance = p5.random(minMoonDistance, maxMoonDistance)

      let moonAngle = p5.random(p5.TWO_PI) // Change this line to add
      let moonSpeed = p5.random(0.001, 0.011) // Add random speed property
      this.moonTextures.push(this.generateMoonTexture(p5))
      let orbitAngle = p5.radians(p5.random(-15, 15))
      this.moons.push({
        radius: moonRadius,
        distance: moonDistance,
        angle: moonAngle,
        speed: moonSpeed, // Add speed property to moon object
        orbitAngle: orbitAngle, // Add the orbitAngle property to the moon object
      })
    }
    this.loadedCount++
  }

  windowResized = (p5) => {
    if (typeof window === "undefined") {
      return // do nothing if window is not defined
    }
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }

  generateRingTexture = (p5, baseColor) => {
    let textureImg = p5.createGraphics(248, 124)
    let numStripes = p5.random(5, 15)
    let stripeHeight = textureImg.height / numStripes

    for (let i = 0; i < numStripes; i++) {
      let brightnessAdjustment = p5.random(-30, 100)
      console.log(p5.red(baseColor), brightnessAdjustment)
      let adjustedColor = p5.color(
        p5.red(baseColor) + brightnessAdjustment,
        p5.green(baseColor) + brightnessAdjustment,
        p5.blue(baseColor) + brightnessAdjustment,
        100,
      )
      textureImg.fill(adjustedColor)
      textureImg.noStroke()
      textureImg.rect(0, i * stripeHeight, textureImg.width, stripeHeight)
    }

    textureImg.updatePixels()
    return textureImg
  }

  generateTexture = (p5, elevationThresholds, colors, planetType) => {
    let textureImg = p5.createGraphics(248, 124)
    textureImg.noiseSeed(p5.random(1000))

    let noiseScale = this.planetType === "gas" ? 1 : 4

    for (let x = 0; x < textureImg.width; x++) {
      for (let y = 0; y < textureImg.height; y++) {
        // Convert x and y to spherical coordinates
        let lon = p5.map(x, 0, textureImg.width, 0, p5.TWO_PI)
        let lat = p5.map(y, 0, textureImg.height, -p5.PI / 2, p5.PI / 2)
        let u = (p5.cos(lat) * p5.cos(lon) + 1) / 2
        let v = (p5.cos(lat) * p5.sin(lon) + 1) / 2
        let elevation = textureImg.noise(u * noiseScale, v * noiseScale)
        let col = p5.color(255)
        let found = false
        for (let i = 0; i < elevationThresholds.length; i++) {
          if (elevation < elevationThresholds[i]) {
            col = p5.lerpColor(
              colors[i],
              colors[i + 1],
              (elevation - (i === 0 ? 0 : elevationThresholds[i - 1])) *
                (1 / (elevationThresholds[i] - (i === 0 ? 0 : elevationThresholds[i - 1]))),
            )
            found = true
            break
          }
        }
        if (!found) {
          col = colors[colors.length - 1] // Assign the last color if elevation is greater than the last threshold
        }
        textureImg.set(x, y, col)
      }
    }
    textureImg.updatePixels()
    return textureImg
  }

  generateMoonTexture = (p5) => {
    let textureImg = p5.createGraphics(62, 31)
    textureImg.noiseSeed(p5.random(1000))

    for (let x = 0; x < textureImg.width; x++) {
      for (let y = 0; y < textureImg.height; y++) {
        let lon = p5.map(x, 0, textureImg.width, 0, p5.TWO_PI)
        let lat = p5.map(y, 0, textureImg.height, -p5.PI / 2, p5.PI / 2)
        let u = (p5.cos(lat) * p5.cos(lon) + 1) / 2
        let v = (p5.cos(lat) * p5.sin(lon) + 1) / 2
        let elevation = textureImg.noise(u * 4, v * 4)
        let col = p5.color(p5.map(elevation, 0, 1, 20, 255))
        textureImg.set(x, y, col)
      }
    }
    textureImg.updatePixels()
    return textureImg
  }
  drawMoon = (p5, moon, moonTexture) => {
    p5.push()
    p5.texture(moonTexture)
    p5.noStroke()
    p5.rotateX(moon.orbitAngle) // Add this line to apply the orbit angle
    p5.rotateY(moon.angle)
    p5.translate(moon.distance, 0, 0)
    p5.rotateZ(p5.radians(95))
    p5.sphere(moon.radius)
    p5.pop()
  }

  draw = (p5) => {
    p5.background(0)
    // Set up ambient light

    // Set up point light
    p5.pointLight(255, 255, 255, 400, -10, 1200)

    // Draw stars
    p5.push()
    p5.translate(0, 0, -1200)
    for (let star of this.stars) {
      p5.stroke(255)
      p5.strokeWeight(star.radius)
      p5.point(star.x, star.y, star.z)
    }
    p5.pop()

    let fixedDistance = 450
    let maxAngle = p5.radians(10)
    let mouseXRatio = p5.map(p5.mouseY, 0, p5.width, -maxAngle, maxAngle)
    let mouseYRatio = p5.map(p5.mouseX, 0, p5.height, -maxAngle, maxAngle)
    let camX = 600 * p5.sin(mouseYRatio)
    let camY = -100
    let camZ = 400
    p5.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0)

    // Rotate planet
    p5.push() // Add push() to isolate the rotation transformation
    p5.rotateY(this.initialRotationY + this.angle)
    p5.rotateX(this.initialRotationX + p5.QUARTER_PI)
    p5.rotateZ(p5.QUARTER_PI)
    this.angle += 0.005

    // Draw planet
    p5.texture(this.textureImg)
    p5.noStroke()
    p5.sphere(this.planetSize)
    p5.pop()

    if (this.hasRings) {
      p5.push()
      p5.rotateX(p5.PI / 2) // Rotate the rings to lie on the XY plane
      p5.pointLight(255, 255, 255, 400, -400, 1200)
      p5.fill(0)
      p5.scale(1, 1, 0.01) // Scale the Z-axis
      p5.texture(this.ringTextureImg) // Apply the ring texture
      p5.noStroke()
      p5.torus(this.ringSize, this.planetSize * 0.3) // Draw the rings using torus function
      p5.pop()
    }

    // Draw moons and their orbits
    for (let i = 0; i < this.numMoons; i++) {
      let moon = this.moons[i]
      let moonTexture = this.moonTextures[i]
      p5.push() // Add push() to isolate the moon rotation transformation
      this.drawMoon(p5, moon, moonTexture)
      p5.pop() // Add pop() to isolate the moon rotation transformation
    }

    // Update moon angles
    for (let moon of this.moons) {
      moon.angle += moon.speed
    }
  }
  render() {
    const { isClient } = this.state
    if (!isClient) {
      return null
    }
    return (
      <div ref={(el) => (this.wrapper = el)}>
        <Sketch setup={this.setup} draw={this.draw} windowResized={this.windowResized} />
      </div>
    )
  }
}

export default PlanetGenerator
