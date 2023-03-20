let angle = 0;
let textureImg;
let stars = [];

function setup() {
  createCanvas(400, 400, WEBGL);

  // Generate texture image
  textureImg = createGraphics(1024, 512);
  textureImg.noiseSeed(random(1000));
  for (let x = 0; x < textureImg.width; x++) {
    for (let y = 0; y < textureImg.height; y++) {
      let elevation = textureImg.noise(x * 0.01, y * 0.01);
      let col = color(0);
      if (elevation < 0.4) {
        col = lerpColor(color(0, 0, 128), color(0, 0, 255), (elevation - 0.2) * 5);
      } else if (elevation < 0.6) {
        col = lerpColor(color(0, 128, 0), color(34, 139, 34), (elevation - 0.4) * 5);
      } else {
        col = lerpColor(color(139, 69, 19), color(255, 250, 240), (elevation - 0.6) * 2.5);
      }
      textureImg.set(x, y, col);
    }
  }
  textureImg.updatePixels();

  // Generate stars
  for (let i = 0; i < 1000; i++) {
    stars.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(width),
      radius: random(0.5, 2),
    });
  }
}

function draw() {
  background(0);

  // Draw stars
  push();
  translate(-width / 2, -height / 2);
  for (let star of stars) {
    stroke(255);
    strokeWeight(star.radius);
    point(star.x, star.y, star.z);
  }
  pop();

  // Set up ambient light
  ambientLight(100);

  // Set up point light
  pointLight(255, 255, 255, 800, 800, 1300);

  // Set up camera
  let camX = map(mouseX, 0, width, -200, 200);
  let camY = map(mouseY, 0, height, -200, 200);
  camera(camX, camY, 500, 0, 0, 0, 0, 1, 0);

  // Rotate planet
  rotateY(angle);
  angle += 0.005;

  // Draw planet
  texture(textureImg);
  noStroke();
  sphere(200);

  // Simple glow effect
  let glowSize = 220;
  let numGlowLayers = 5;
  let glowColor = color(255, 100, 80, 10);
  for (let i = 1; i <= numGlowLayers; i++) {
    fill(glowColor);
    sphere(glowSize + i * 2);
  }
}
