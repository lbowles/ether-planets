// let seed = 12345
// let planetSize = 45 // random(30, 170)
// let hasRings = true // random() < 0.5 // 50% chance
// let numMoons = 2 // floor(random(0, 5)) // Up to 3 moons
// let planetType = 0 // 0 = gas, 1 = solid
// let baseHue = 123 // random(0, 360)
// let hasWater = true // random() < 0.1 // 10% chance

let angle = 0
let textureImg
let initialRotationX
let initialRotationY
let ringSize
let numRingParticles
let moonSize
let ringTextureImg
let stars = []
let rings = []
let moons = []
let moonTextures = []

function setup() {
  randomSeed(seed)
  createCanvas(500, 500, WEBGL)
  colorMode(HSL, 360, 100, 100)

  let randomPalette = generatePlanetColors(baseHue)
  let numColors = randomPalette.length

  colorMode(RGB, 255)
  let thresholds = []
  for (let i = 0; i < numColors - 1; i++) {
    let r
    do {
      r = random()
    } while (r < 0.2) // Should have at least 20% of the planet covered by water or primary colour
    thresholds.push(r)
  }
  thresholds.sort()

  let textureInput = {
    thresholds: thresholds,
    colors: randomPalette,
  }

  // Generate stars
  for (let i = 0; i < 500; i++) {
    stars.push({
      x: random(-width * 5, width * 5),
      y: random(-height * 5, height * 5),
      z: random(width * 5),
      radius: random(0.5, 2),
    })
  }

  initialRotationX = random(360)
  initialRotationY = 148
  textureImg = generateTexture(textureInput.thresholds, textureInput.colors, planetType)

  if (hasRings) {
    ringSize = random(planetSize * 1.4, planetSize * 1.5)
    ringTextureImg = generateRingTexture(randomPalette)
  }

  // Generate moons
  for (let i = 0; i < numMoons; i++) {
    let moonRadius = random(planetSize * 0.05, planetSize * 0.21)

    let minMoonDistance = hasRings ? ringSize * 1.3 : planetSize * 1.5 // Change minimum distance based on presence of rings
    let maxMoonDistance = 300
    let moonDistance = random(minMoonDistance, maxMoonDistance)

    let moonAngle = random(TWO_PI) // Change this line to add
    let moonSpeed = random(0.001, 0.011) // Add random speed property
    moonTextures.push(generateMoonTexture())
    let orbitAngle = radians(random(-15, 15))
    moons.push({
      radius: moonRadius,
      distance: moonDistance,
      angle: moonAngle,
      speed: moonSpeed, // Add speed property to moon object
      orbitAngle: orbitAngle, // Add the orbitAngle property to the moon object
    })
  }
}

function generatePlanetColors(baseHue) {
  let colorPalette = []
  const hueVariation = 5
  const saturationBase = 60
  const saturationVariation = 15
  const lightnessBase = 40
  const lightnessVariation = 10
  const waterHue = 210
  const waterSaturation = 70
  const waterLightness = 50

  for (let i = 0; i < 4; i++) {
    let hue, saturation, lightness
    hue = (baseHue + i * hueVariation) % 360
    saturation = Math.max(0, Math.min(100, saturationBase - i * saturationVariation))
    lightness = Math.max(0, Math.min(100, lightnessBase + i * lightnessVariation))
    colorPalette.push(color(hue, saturation, lightness))
  }

  if (hasWater) {
    colorPalette = [color(waterHue, waterSaturation, waterLightness), ...colorPalette]
  }

  return colorPalette
}

function generateRingTexture(colors) {
  let textureImg = createGraphics(248, 124)
  let numStripes = random(5, 15)
  let stripeHeight = textureImg.height / numStripes

  let mutedColors = [colors[2], colors[3]]

  for (let i = 0; i < numStripes; i++) {
    const col = mutedColors[i % mutedColors.length]
    col.setAlpha(0.5)
    textureImg.fill(col)
    textureImg.noStroke()
    textureImg.rect(0, i * stripeHeight, textureImg.width, stripeHeight)
  }

  textureImg.updatePixels()
  return textureImg
}

function generateTexture(elevationThresholds, colors, planetType) {
  let textureImg = createGraphics(248 * 2, 124 * 2)
  textureImg.noiseSeed(random(1000))

  let noiseScale = planetType === 0 ? 1 : 4

  for (let x = 0; x < textureImg.width; x++) {
    for (let y = 0; y < textureImg.height; y++) {
      // Convert x and y to spherical coordinates
      let lon = map(x, 0, textureImg.width, 0, TWO_PI)
      let lat = map(y, 0, textureImg.height, -PI / 2, PI / 2)
      let u = (cos(lat) * cos(lon) + 1) / 2
      let v = (cos(lat) * sin(lon) + 1) / 2
      let elevation = textureImg.noise(u * noiseScale, v * noiseScale)
      let col = color(255)
      let found = false
      for (let i = 0; i < elevationThresholds.length; i++) {
        if (elevation < elevationThresholds[i]) {
          if (i == 0 && hasWater) {
            col = colors[0]
          } else {
            col = lerpColor(
              colors[i],
              colors[i + 1],
              (elevation - (i === 0 ? 0 : elevationThresholds[i - 1])) *
                (1 / (elevationThresholds[i] - (i === 0 ? 0 : elevationThresholds[i - 1]))),
            )
          }
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
  // console.log(
  //   `Water count: ${Math.round((waterCount / (textureImg.width * textureImg.height)) * 100)}% (${waterCount}/${
  //     textureImg.width * textureImg.height
  //   })`,
  // )
  textureImg.updatePixels()
  return textureImg
}

function generateMoonTexture() {
  let textureImg = createGraphics(62, 31)
  textureImg.noiseSeed(random(1000))

  for (let x = 0; x < textureImg.width; x++) {
    for (let y = 0; y < textureImg.height; y++) {
      let lon = map(x, 0, textureImg.width, 0, TWO_PI)
      let lat = map(y, 0, textureImg.height, -PI / 2, PI / 2)
      let u = (cos(lat) * cos(lon) + 1) / 2
      let v = (cos(lat) * sin(lon) + 1) / 2
      let elevation = textureImg.noise(u * 4, v * 4)
      let col = color(map(elevation, 0, 1, 20, 255))
      textureImg.set(x, y, col)
    }
  }
  textureImg.updatePixels()
  return textureImg
}
function drawMoon(moon, moonTexture) {
  push()
  texture(moonTexture)
  noStroke()
  rotateX(moon.orbitAngle) // Add this line to apply the orbit angle
  rotateY(moon.angle)
  translate(moon.distance, 0, 0)
  rotateZ(radians(95))
  sphere(moon.radius)
  pop()
}

function draw() {
  background(0)
  // Set up ambient light
  ambientLight(100)
  ambientMaterial(0)

  // Set up point light
  pointLight(255, 255, 255, 400, -10, 1200)

  // Draw stars
  push()
  translate(0, 0, -1200)
  for (let star of stars) {
    stroke(255)
    strokeWeight(star.radius)
    point(star.x, star.y, star.z)
  }
  pop()

  let maxAngle = radians(10)
  let mouseXRatio = map(mouseX, 0, width, -maxAngle, maxAngle)
  let mouseYRatio = map(mouseY, 0, height, -maxAngle, maxAngle)
  let camX = 400 * sin(mouseXRatio)
  let camY = -100 * cos(mouseYRatio)
  let camZ = 400
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0)

  // Rotate planet
  push() // Add push() to isolate the rotation transformation
  rotateY(initialRotationY + angle)
  rotateX(initialRotationX + QUARTER_PI)
  rotateZ(QUARTER_PI)
  angle += 0.005

  // Draw planet
  texture(textureImg)
  noStroke()
  sphere(planetSize)
  pop()

  if (hasRings) {
    push()
    rotateX(PI / 2) // Rotate the rings to lie on the XY plane
    pointLight(255, 255, 255, 400, -400, 1200)
    scale(1, 1, 0.01) // Scale the Z-axis
    texture(ringTextureImg) // Apply the ring texture
    noStroke()
    torus(ringSize, planetSize * 0.3) // Draw the rings using torus function
    pop()
  }

  // Draw moons and their orbits
  for (let i = 0; i < numMoons; i++) {
    let moon = moons[i]
    let moonTexture = moonTextures[i]
    push() // Add push() to isolate the moon rotation transformation
    drawMoon(moon, moonTexture)
    pop() // Add pop() to isolate the moon rotation transformation
  }
  // Update moon angles
  for (let moon of moons) {
    moon.angle += moon.speed
  }
}
