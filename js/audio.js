const audioState = {
  get time() {
    return parseFloat(sessionStorage.getItem("audioTime") || "0");
  },
  set time(val) {
    sessionStorage.setItem("audioTime", val);
  },
  get isPlaying() {
    return sessionStorage.getItem("audioPlaying") === "true";
  },
  set isPlaying(val) {
    sessionStorage.setItem("audioPlaying", val ? "true" : "false");
  },
};

function setupSmoothNavigation() {
  const toggleCheckbox = document.querySelector(".toggle-switch input");
  if (toggleCheckbox) {
    toggleCheckbox.removeAttribute("onchange");

    toggleCheckbox.addEventListener("change", function (e) {
      e.preventDefault();
      // Determine target page based on current page
      const isGeekPage = window.location.pathname.endsWith("geek.html");
      const targetPage = isGeekPage ? "index.html" : "geek.html";

      const audio = document.getElementById("bg-music");
      if (audio) {
        audioState.time = audio.currentTime;
        audioState.isPlaying = !audio.paused;
      }
      window.location.href = targetPage;
    });
  }
}

function initAudio() {
  let audio = document.getElementById("bg-music");

  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "bg-music";
    audio.src = "assets/audio.mp3";
    audio.loop = true;
    document.body.appendChild(audio);
  }

  const savedTime = audioState.time;
  const wasPlaying = audioState.isPlaying;
  const overlay = document.getElementById("audio-overlay");

  if (savedTime) {
    audio.currentTime = savedTime;
    audio.addEventListener("loadedmetadata", () => {
      audio.currentTime = savedTime;
    });
  }

  const startAudio = function () {
    if (savedTime && Math.abs(audio.currentTime - savedTime) > 1) {
      audio.currentTime = savedTime;
    }
    audio
      .play()
      .then(() => {
        audioState.isPlaying = true;
      })
      .catch((err) => console.log("Audio play failed:", err));
  };

  // Check if user has already opened the envelope
  const hasOpenedEnvelope = sessionStorage.getItem("envelopeOpened") === "true";

  if (overlay) {
    overlay.addEventListener("click", function () {
      const envelope = document.getElementById("envelope");
      if (envelope) {
        envelope.classList.add("open");
      }
      sessionStorage.setItem("envelopeOpened", "true");

      startAudio();

      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.display = "none";
        }, 800);
      }, 600);
    });

    if (wasPlaying || hasOpenedEnvelope) {
      overlay.style.display = "none";
      audio
        .play()
        .then(() => {
          audioState.isPlaying = true;
        })
        .catch(() => {
          overlay.style.display = "flex";
          overlay.style.opacity = "1";
        });
    } else {
      overlay.style.display = "flex";
      overlay.style.opacity = "1";
    }
  } else {
    // Safari will block Geek Mode audio unless user clicks.
    // We add a full screen transparent div to catch the first tap.
    const safariCatcher = document.createElement("div");
    safariCatcher.style.position = "fixed";
    safariCatcher.style.top = "0";
    safariCatcher.style.left = "0";
    safariCatcher.style.width = "100%";
    safariCatcher.style.height = "100%";
    safariCatcher.style.zIndex = "9999";
    safariCatcher.style.cursor = "pointer";
    safariCatcher.style.display = "none";
    document.body.appendChild(safariCatcher);

    const playHandler = function () {
      startAudio();
      safariCatcher.remove();
    };
    safariCatcher.addEventListener("click", playHandler);
    safariCatcher.addEventListener("touchstart", playHandler);

    if (wasPlaying) {
      audio
        .play()
        .then(() => {
          audioState.isPlaying = true;
        })
        .catch(() => {
          safariCatcher.style.display = "block";
        });
    } else {
      safariCatcher.style.display = "block";
    }
  }

  setInterval(() => {
    if (!audio.paused) {
      audioState.time = audio.currentTime;
    }
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  setupSmoothNavigation();
  initAudio();
});
