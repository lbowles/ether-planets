import React, { useEffect } from "react"
import Sketch from "react-p5"

function Planet() {
  let angle = 0
  let textureImg
  let stars = []
  let planetSize
  let initialRotationX
  let initialRotationY
  let hasRings
  let rings = []
  let ringSize
  let numRingParticles
  let numMoons
  let moonSize
  let moons = []
  let moonTextures = []
  let planetType

  function setup(p5, canvasParentRef) {
    p5.randomSeed(1767)
    p5.createCanvas(500, 500, p5.WEBGL)
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
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: p5.random(-p5.width * 5, p5.width * 5),
        y: p5.random(-p5.height * 5, p5.height * 5),
        z: p5.random(p5.width * 5),
        radius: p5.random(0.5, 2),
      })
    }

    planetSize = p5.random(20, 100)
    initialRotationX = p5.random(p5.TWO_PI)
    initialRotationY = 148
    planetType = p5.random() < 0.5 ? "gas" : "solid"
    textureImg = generateTexture(randomColorPalette.thresholds, randomColorPalette.colors, planetType)

    hasRings = p5.random() < 0.5 // 50% chance of having rings
    if (hasRings) {
      ringSize = p5.random(planetSize * 1.5, planetSize * 1.7)
      let baseColor = p5.random(randomColorPalette.colors) // Select a random color from the planet's color palette
      ringTextureImg = generateRingTexture(baseColor) // Pass the base color to generateRingTexture()
    }

    // Generate moons
    numMoons = p5.random(0, p5.random(4)) // Up to 3 moons
    for (let i = 0; i < numMoons; i++) {
      let moonRadius = p5.random(planetSize * 0.08, planetSize * 0.21)

      let minMoonDistance = hasRings ? ringSize * 1.2 : planetSize * 1.5 // Change minimum distance based on presence of rings
      let maxMoonDistance = planetSize * 8
      let moonDistance = p5.random(minMoonDistance, maxMoonDistance)

      let moonAngle = p5.random(p5.TWO_PI) // Change this line to add
      let moonSpeed = p5.random(0.001, 0.011) // Add random speed property
      moonTextures.push(generateMoonTexture())
      let orbitAngle = p5.radians(p5.random(-15, 15))
      moons.push({
        radius: moonRadius,
        distance: moonDistance,
        angle: moonAngle,
        speed: moonSpeed, // Add speed property to moon object
        orbitAngle: orbitAngle, // Add the orbitAngle property to the moon object
      })
    }
  }

  function draw(p5) {
    p5.background(0)

    // Set up point light
    p5.pointLight(255, 255, 255, 400, -10, 1200)

    // Draw stars
    p5.push()
    p5.translate(0, 0, -1200)
    for (let star of stars) {
      p5.stroke(255)
      p5.strokeWeight(star.radius)
      p5.point(star.x, star.y, star.z)
    }
    p5.pop()

    let fixedDistance = 450
    let maxAngle = p5.radians(10)
    let mouseXRatio = p5.map(p5.mouseX, 0, p5.width, -maxAngle, maxAngle)
    let mouseYRatio = p5.map(p5.mouseY, 0, p5.height, -maxAngle, maxAngle)
    let camX = 400 * p5.sin(mouseYRatio)
    let camY = -100 * p5.cos(mouseXRatio)
    let camZ = 400
    p5.camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0)

    // Rotate planet
    p5.push() // Add push() to isolate the rotation transformation
    p5.rotateY(initialRotationY + angle)
    p5.rotateX(initialRotationX + p5.QUARTER_PI)
    p5.rotateZ(p5.QUARTER_PI)
    angle += 0.005

    // Draw planet
    p5.texture(textureImg)
    p5.noStroke()
    p5.sphere(planetSize)
    p5.pop()

    if (hasRings) {
      p5.push()
      p5.rotateX(p5.PI / 2) // Rotate the rings to lie on the XY plane
      p5.pointLight(255, 255, 255, 400, -400, 1200)
      p5.scale(1, 1, 0.01) // Scale the Z-axis
      p5.texture(ringTextureImg) // Apply the ring texture
      p5.noStroke()
      p5.torus(ringSize, planetSize * 0.3) // Draw the rings using torus function
      p5.pop()
    }

    // Draw moons and their orbits
    for (let i = 0; i < numMoons; i++) {
      let moon = moons[i]
      let moonTexture = moonTextures[i]
      p5.push() // Add push() to isolate the moon rotation transformation
      drawMoon(p5, moon, moonTexture)
      p5.pop() // Add pop() to isolate the moon rotation transformation
    }
    // Update moon angles
    for (let moon of moons) {
      moon.angle += moon.speed
    }
  }

  useEffect(() => {
    return () => {
      const canvas = document.querySelector("canvas")
      canvas.remove()
    }
  }, [])

  return <Sketch setup={setup} draw={draw} />
}

export default Planet
