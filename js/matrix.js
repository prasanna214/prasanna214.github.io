/* ================= MATRIX BACKGROUND ================= */

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

const letters = "01";
const fontSize = 14;

let columns = 0;
let drops = [];

function resizeCanvas() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  columns = Math.floor(canvas.width / fontSize);
  drops = Array(columns).fill(1);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawMatrix() {
  // Fade effect to create trailing letters
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Matrix text color (medium bright)
  ctx.fillStyle = "rgba(0, 255, 65, 0.6)";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

let lastFrameTime = 0;
const frameDelay = 35; // Target around ~28 FPS

function renderMatrix(timestamp) {
  if (timestamp - lastFrameTime >= frameDelay) {
    drawMatrix();
    lastFrameTime = timestamp;
  }
  requestAnimationFrame(renderMatrix);
}

requestAnimationFrame(renderMatrix);
