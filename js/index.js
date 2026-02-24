const starField = document.getElementById("star-field");

// Create a rotating container for the universe
const universe = document.createElement("div");
universe.className = "rotating-universe";
starField.appendChild(universe);

// Create background stars
for (let i = 0; i < 800; i++) {
  const star = document.createElement("div");
  star.className = "star";
  // Make stars slightly larger (0.5px to 3px)
  const size = Math.random() * 2.5 + 0.5;
  star.style.width = size + "px";
  star.style.height = size + "px";
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  // Higher base opacity (0.5 to 1.0)
  star.style.opacity = Math.random() * 0.5 + 0.5;

  // Give more stars a twinkling effect
  if (Math.random() > 0.6) {
    star.style.animation = `twinkle ${Math.random() * 3 + 1.5}s infinite alternate ease-in-out`;
  }
  universe.appendChild(star);
}

// Shooting star logic
function createShootingStar() {
  const ss = document.createElement("div");
  ss.className = "shooting-star";
  ss.style.top = Math.random() * 80 + "%";
  ss.style.left = Math.random() * 80 + "%";
  ss.style.animation = `shoot ${Math.random() * 2 + 1}s ease-out forwards`;
  universe.appendChild(ss);

  setTimeout(() => ss.remove(), 3000);
}

// Increase frequency of shooting stars
setInterval(createShootingStar, 800);
