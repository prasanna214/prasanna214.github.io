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
  }

  const startAudio = function () {
    audio
      .play()
      .then(() => {
        audioState.isPlaying = true;
      })
      .catch((err) => console.log("Audio play failed:", err));
  };

  if (overlay) {
    overlay.addEventListener("click", function () {
      const envelope = document.getElementById("envelope");
      if (envelope) {
        envelope.classList.add("open");
      }

      startAudio();

      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.display = "none";
        }, 800);
      }, 600);
    });

    if (wasPlaying) {
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
    // Basic setup without overlay (e.g., geek mode)
    const playHandler = function () {
      startAudio();
      document.removeEventListener("click", playHandler);
      document.removeEventListener("touchstart", playHandler);
    };

    if (wasPlaying) {
      audio
        .play()
        .then(() => {
          audioState.isPlaying = true;
        })
        .catch(() => {
          document.addEventListener("click", playHandler);
          document.addEventListener("touchstart", playHandler);
        });
    } else {
      document.addEventListener("click", playHandler);
      document.addEventListener("touchstart", playHandler);
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
